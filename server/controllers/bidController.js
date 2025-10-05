const Bid = require('../models/Bid');
const Item = require('../models/Item');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create new bid
// @route   POST /api/bids
// @access  Private
const createBid = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'נתונים לא תקינים',
        errors: errors.array()
      });
    }

    const { itemId, amount } = req.body;
    const userId = req.user.id;

    // Check if item exists and is approved
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        message: 'הפריט לא נמצא'
      });
    }

    if (item.status !== 'approved') {
      return res.status(400).json({
        message: 'לא ניתן להציע על פריט זה'
      });
    }

    // Check if auction has ended
    if (new Date() > new Date(item.endDate)) {
      return res.status(400).json({
        message: 'המכירה הסתיימה'
      });
    }

    // Check if user is not the seller
    if (item.userId.toString() === userId) {
      return res.status(400).json({
        message: 'לא ניתן להציע על הפריט שלך'
      });
    }

    // Check if bid amount is higher than current price
    if (amount <= item.currentPrice) {
      return res.status(400).json({
        message: `ההצעה חייבת להיות גבוהה מ-${item.currentPrice} ₪`
      });
    }

    // Check if there's a minimum bid increment (1 ₪ minimum)
    const minBidIncrement = 1;
    if (amount < item.currentPrice + minBidIncrement) {
      return res.status(400).json({
        message: `ההצעה חייבת להיות גבוהה לפחות ב-${minBidIncrement} ₪ מהמחיר הנוכחי`
      });
    }

    // Create new bid
    const bid = await Bid.create({
      amount,
      userId,
      itemId,
      isWinning: true
    });

    // Update item's current price and bids count
    await Item.findByIdAndUpdate(itemId, {
      currentPrice: amount,
      $inc: { bidsCount: 1 }
    });

    // Get the bid with user details
    const populatedBid = await Bid.findById(bid._id)
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'ההצעה נשלחה בהצלחה',
      bid: populatedBid
    });
  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({
      message: 'שגיאה בשליחת ההצעה',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get bids for an item
// @route   GET /api/bids/item/:itemId
// @access  Public
const getItemBids = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const bids = await Bid.find({ itemId, isActive: true })
      .populate('userId', 'name email')
      .sort({ amount: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bid.countDocuments({ itemId, isActive: true });

    res.json({
      success: true,
      bids,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get item bids error:', error);
    res.status(500).json({
      message: 'שגיאה בקבלת ההצעות',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user's bids
// @route   GET /api/bids/my-bids
// @access  Private
const getMyBids = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;

    let query = { userId, isActive: true };
    
    // Add status filter based on item status
    if (status) {
      const itemStatusQuery = {};
      switch (status) {
        case 'active':
          itemStatusQuery.status = 'approved';
          itemStatusQuery.endDate = { $gt: new Date() };
          break;
        case 'ended':
          itemStatusQuery.status = 'ended';
          break;
        case 'won':
          itemStatusQuery.status = 'ended';
          itemStatusQuery.winnerId = userId;
          break;
      }
      
      if (Object.keys(itemStatusQuery).length > 0) {
        const items = await Item.find(itemStatusQuery).select('_id');
        query.itemId = { $in: items.map(item => item._id) };
      }
    }

    const bids = await Bid.find(query)
      .populate({
        path: 'itemId',
        select: 'name images currentPrice endDate status winnerId',
        populate: {
          path: 'winnerId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bids
    });
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({
      message: 'שגיאה בקבלת ההצעות שלי',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get highest bid for an item
// @route   GET /api/bids/highest/:itemId
// @access  Public
const getHighestBid = async (req, res) => {
  try {
    const { itemId } = req.params;

    const highestBid = await Bid.findOne({ itemId, isActive: true })
      .populate('userId', 'name email')
      .sort({ amount: -1 });

    res.json({
      success: true,
      bid: highestBid
    });
  } catch (error) {
    console.error('Get highest bid error:', error);
    res.status(500).json({
      message: 'שגיאה בקבלת ההצעה הגבוהה',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Cancel bid (if auction hasn't ended)
// @route   DELETE /api/bids/:bidId
// @access  Private
const cancelBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.id;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({
        message: 'ההצעה לא נמצאה'
      });
    }

    // Check if user owns the bid
    if (bid.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'אין הרשאה לבטל הצעה זו'
      });
    }

    // Check if auction has ended
    const item = await Item.findById(bid.itemId);
    if (new Date() > new Date(item.endDate)) {
      return res.status(400).json({
        message: 'לא ניתן לבטל הצעה לאחר סיום המכירה'
      });
    }

    // If this was the winning bid, update item's current price
    if (bid.isWinning) {
      const secondHighestBid = await Bid.findOne({
        itemId: bid.itemId,
        _id: { $ne: bidId },
        isActive: true
      }).sort({ amount: -1 });

      const newCurrentPrice = secondHighestBid ? secondHighestBid.amount : item.startPrice;
      
      await Item.findByIdAndUpdate(bid.itemId, {
        currentPrice: newCurrentPrice
      });

      // Make the second highest bid winning
      if (secondHighestBid) {
        await Bid.findByIdAndUpdate(secondHighestBid._id, {
          isWinning: true
        });
      }
    }

    // Deactivate the bid
    await Bid.findByIdAndUpdate(bidId, {
      isActive: false
    });

    res.json({
      success: true,
      message: 'ההצעה בוטלה בהצלחה'
    });
  } catch (error) {
    console.error('Cancel bid error:', error);
    res.status(500).json({
      message: 'שגיאה בביטול ההצעה',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get bid statistics for an item
// @route   GET /api/bids/stats/:itemId
// @access  Public
const getBidStats = async (req, res) => {
  try {
    const { itemId } = req.params;

    const stats = await Bid.aggregate([
      { $match: { itemId: mongoose.Types.ObjectId(itemId), isActive: true } },
      {
        $group: {
          _id: null,
          totalBids: { $sum: 1 },
          highestBid: { $max: '$amount' },
          lowestBid: { $min: '$amount' },
          averageBid: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalBids: 0,
        highestBid: 0,
        lowestBid: 0,
        averageBid: 0
      }
    });
  } catch (error) {
    console.error('Get bid stats error:', error);
    res.status(500).json({
      message: 'שגיאה בקבלת סטטיסטיקות ההצעות',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  createBid,
  getItemBids,
  getMyBids,
  getHighestBid,
  cancelBid,
  getBidStats
};
