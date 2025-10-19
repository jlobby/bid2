const express = require('express');
const { body } = require('express-validator');
const {
  getItems,
  getItem,
  createItem,
  getMyItems,
  updateItem,
  deleteItem,
  approveItem,
  rejectItem,
  getPendingItems
} = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validation rules
const createItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('שם הפריט הוא שדה חובה')
    .isLength({ max: 100 })
    .withMessage('שם הפריט לא יכול להיות יותר מ-100 תווים'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('תיאור הפריט הוא שדה חובה')
    .isLength({ max: 1000 })
    .withMessage('התיאור לא יכול להיות יותר מ-1000 תווים'),
  body('startPrice')
    .isFloat({ min: 0 })
    .withMessage('מחיר הפתיחה חייב להיות מספר חיובי'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('מיקום איסוף הוא שדה חובה')
    .isLength({ max: 200 })
    .withMessage('המיקום לא יכול להיות יותר מ-200 תווים'),
  body('endDate')
    .isISO8601()
    .withMessage('תאריך סיום חייב להיות תאריך תקין')
    .custom((value) => {
      const endDate = new Date(value);
      const now = new Date();
      const maxDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      
      if (endDate <= now) {
        throw new Error('תאריך הסיום חייב להיות בעתיד');
      }
      if (endDate > maxDate) {
        throw new Error('תאריך הסיום לא יכול להיות יותר מ-2 ימים מהיום');
      }
      return true;
    }),
  body('category')
    .isIn(['electronics', 'furniture', 'clothing', 'books', 'sports', 'jewelry', 'art', 'other'])
    .withMessage('קטגוריה לא תקינה'),
  body('condition')
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('מצב הפריט לא תקין')
];

const updateItemValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('שם הפריט לא יכול להיות ריק')
    .isLength({ max: 100 })
    .withMessage('שם הפריט לא יכול להיות יותר מ-100 תווים'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('תיאור הפריט לא יכול להיות ריק')
    .isLength({ max: 1000 })
    .withMessage('התיאור לא יכול להיות יותר מ-1000 תווים'),
  body('startPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('מחיר הפתיחה חייב להיות מספר חיובי'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('מיקום איסוף לא יכול להיות ריק')
    .isLength({ max: 200 })
    .withMessage('המיקום לא יכול להיות יותר מ-200 תווים'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('תאריך סיום חייב להיות תאריך תקין')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('תאריך הסיום חייב להיות בעתיד');
      }
      return true;
    }),
  body('category')
    .optional()
    .isIn(['electronics', 'furniture', 'clothing', 'books', 'sports', 'jewelry', 'art', 'other'])
    .withMessage('קטגוריה לא תקינה'),
  body('condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('מצב הפריט לא תקין')
];

// @route   GET /api/items
// @desc    Get all approved items
// @access  Public
router.get('/', getItems);

// @route   GET /api/items/pending
// @desc    Get pending items (Admin only)
// @access  Private/Admin
router.get('/pending', authMiddleware, adminMiddleware, getPendingItems);

// @route   DELETE /api/items/clear-all
// @desc    Clear all data (admin only)
// @access  Private/Admin
router.delete('/clear-all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const Item = require('../models/Item');
    const Bid = require('../models/Bid');
    
    // Delete all items
    const deletedItems = await Item.deleteMany({});
    
    // Delete all bids
    const deletedBids = await Bid.deleteMany({});
    
    // Delete all users except admin
    const deletedUsers = await User.deleteMany({ role: { $ne: 'admin' } });
    
    res.json({
      success: true,
      message: 'כל הנתונים נמחקו בהצלחה',
      deleted: {
        items: deletedItems.deletedCount,
        bids: deletedBids.deletedCount,
        users: deletedUsers.deletedCount
      }
    });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת נתונים'
    });
  }
});

// @route   GET /api/items/stats
// @desc    Get website statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const Item = require('../models/Item');
    const Bid = require('../models/Bid');
    
    // Count active items (approved and not ended)
    const activeItems = await Item.countDocuments({
      status: 'approved',
      endDate: { $gt: new Date() }
    });
    
    // Count total users
    const totalUsers = await User.countDocuments();
    
    // Count total bids
    const totalBids = await Bid.countDocuments();
    
    // Count items ending today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const endingToday = await Item.countDocuments({
      status: 'approved',
      endDate: { $gte: today, $lt: tomorrow }
    });
    
    res.json({
      success: true,
      stats: {
        activeItems,
        totalUsers,
        totalBids,
        endingToday
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת סטטיסטיקות'
    });
  }
});

// @route   GET /api/items/my-items
// @desc    Get user's items
// @access  Private
router.get('/my-items', authMiddleware, getMyItems);

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Public
router.get('/:id', getItem);

// @route   POST /api/items
// @desc    Create new item
// @access  Private
router.post('/', 
  authMiddleware, 
  upload.array('images', 5), 
  handleUploadError,
  createItemValidation, 
  createItem
);

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private
router.put('/:id', 
  authMiddleware, 
  upload.array('images', 5), 
  handleUploadError,
  updateItemValidation, 
  updateItem
);

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private
router.delete('/:id', authMiddleware, deleteItem);

// @route   PUT /api/items/:id/approve
// @desc    Approve item (Admin only)
// @access  Private/Admin
router.put('/:id/approve', authMiddleware, adminMiddleware, approveItem);

// @route   PUT /api/items/:id/reject
// @desc    Reject item (Admin only)
// @access  Private/Admin
router.put('/:id/reject', 
  authMiddleware, 
  adminMiddleware,
  [
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('סיבת הדחייה לא יכולה להיות יותר מ-500 תווים')
  ],
  rejectItem
);

module.exports = router;

