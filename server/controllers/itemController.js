const Item = require('../models/Item');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// @desc    Get all approved items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sort = 'endDate' } = req.query;
    
    const query = { 
      status: 'approved',
      isActive: true,
      endDate: { $gt: new Date() }
    };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price-low':
        sortOption = { currentPrice: 1 };
        break;
      case 'price-high':
        sortOption = { currentPrice: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'ending-soon':
        sortOption = { endDate: 1 };
        break;
      default:
        sortOption = { endDate: 1 };
    }

    const items = await Item.find(query)
      .populate('userId', 'name email')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Item.countDocuments(query);

    res.json({
      success: true,
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      message: 'שגיאה בקבלת הפריטים',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('winnerId', 'name email');

    if (!item) {
      return res.status(404).json({
        message: 'הפריט לא נמצא'
      });
    }

    // Get bids for this item
    const bids = await Bid.find({ itemId: req.params.id, isActive: true })
      .populate('userId', 'name')
      .sort({ amount: -1, createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      item,
      bids
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      message: 'שגיאה בקבלת הפריט',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    console.log('📝 יצירת פריט חדש...');
    console.log('📁 קבצים שהתקבלו:', req.files ? req.files.length : 0);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ שגיאות ולידציה:', errors.array());
      return res.status(400).json({
        message: 'נתונים לא תקינים',
        errors: errors.array()
      });
    }

    const { name, description, startPrice, location, endDate, category, condition, pricingType } = req.body;
    
    // Handle uploaded images
    const images = req.files ? req.files.map(file => {
      console.log('📸 קובץ תמונה:', file.filename, 'נתיב:', file.path);
      return file.path;
    }) : [];

    console.log('🖼️ תמונות שנשמרו:', images);

    if (images.length === 0) {
      console.log('❌ לא הועלו תמונות');
      return res.status(400).json({
        message: 'יש להעלות לפחות תמונה אחת'
      });
    }

    // Set pricing based on type
    const finalStartPrice = pricingType === 'free' ? 0 : parseFloat(startPrice);
    const pricingStatus = pricingType === 'paid' ? 'paid_requested' : 'free';
    
    const item = await Item.create({
      name,
      description,
      images,
      startPrice: finalStartPrice,
      currentPrice: finalStartPrice,
      location,
      endDate: new Date(endDate),
      category,
      condition,
      userId: req.user.id,
      promotionStatus: pricingStatus,
      isPaidPromotion: pricingType === 'paid'
    });

    const populatedItem = await Item.findById(item._id)
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'הפריט נוצר בהצלחה וממתין לאישור מנהל',
      item: populatedItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      message: 'שגיאה ביצירת הפריט',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user's items
// @route   GET /api/items/my-items
// @access  Private
const getMyItems = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const items = await Item.find(query)
      .populate('winnerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({
      message: 'שגיאה בקבלת הפריטים שלי',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'נתונים לא תקינים',
        errors: errors.array()
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'הפריט לא נמצא'
      });
    }

    // Check if user owns the item
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'אין הרשאה לערוך פריט זה'
      });
    }

    // Can only edit pending items
    if (item.status !== 'pending') {
      return res.status(400).json({
        message: 'ניתן לערוך רק פריטים ממתינים לאישור'
      });
    }

    const { name, description, startPrice, location, endDate, category, condition } = req.body;
    
    // Handle new images
    let images = item.images;
    if (req.files && req.files.length > 0) {
      // Delete old images
      item.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
      images = req.files.map(file => file.path);
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        images,
        startPrice: parseFloat(startPrice),
        currentPrice: parseFloat(startPrice),
        location,
        endDate: new Date(endDate),
        category,
        condition
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.json({
      success: true,
      message: 'הפריט עודכן בהצלחה',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      message: 'שגיאה בעדכון הפריט',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'הפריט לא נמצא'
      });
    }

    // Check if user owns the item or is admin
    if (item.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'אין הרשאה למחוק פריט זה'
      });
    }

    // Can only delete pending items
    if (item.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({
        message: 'ניתן למחוק רק פריטים ממתינים לאישור'
      });
    }

    // Delete associated images
    item.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    // Delete associated bids
    await Bid.deleteMany({ itemId: req.params.id });

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'הפריט נמחק בהצלחה'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      message: 'שגיאה במחיקת הפריט',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Approve item (Admin only)
// @route   PUT /api/items/:id/approve
// @access  Private/Admin
const approveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'הפריט לא נמצא'
      });
    }

    if (item.status !== 'pending') {
      return res.status(400).json({
        message: 'הפריט כבר עבר תהליך אישור'
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('userId', 'name email');

    res.json({
      success: true,
      message: 'הפריט אושר בהצלחה',
      item: updatedItem
    });
  } catch (error) {
    console.error('Approve item error:', error);
    res.status(500).json({
      message: 'שגיאה באישור הפריט',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Reject item (Admin only)
// @route   PUT /api/items/:id/reject
// @access  Private/Admin
const rejectItem = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'הפריט לא נמצא'
      });
    }

    if (item.status !== 'pending') {
      return res.status(400).json({
        message: 'הפריט כבר עבר תהליך אישור'
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason 
      },
      { new: true }
    ).populate('userId', 'name email');

    res.json({
      success: true,
      message: 'הפריט נדחה',
      item: updatedItem
    });
  } catch (error) {
    console.error('Reject item error:', error);
    res.status(500).json({
      message: 'שגיאה בדחיית הפריט',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get pending items (Admin only)
// @route   GET /api/items/pending
// @access  Private/Admin
const getPendingItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Get pending items error:', error);
    res.status(500).json({
      message: 'שגיאה בקבלת הפריטים הממתינים',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  getMyItems,
  updateItem,
  deleteItem,
  approveItem,
  rejectItem,
  getPendingItems
};

