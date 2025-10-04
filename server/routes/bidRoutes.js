const express = require('express');
const { body } = require('express-validator');
const {
  createBid,
  getItemBids,
  getMyBids,
  getHighestBid,
  cancelBid,
  getBidStats
} = require('../controllers/bidController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createBidValidation = [
  body('itemId')
    .isMongoId()
    .withMessage('מזהה פריט לא תקין'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('סכום ההצעה חייב להיות מספר חיובי')
];

// @route   POST /api/bids
// @desc    Create new bid
// @access  Private
router.post('/', authMiddleware, createBidValidation, createBid);

// @route   GET /api/bids/item/:itemId
// @desc    Get bids for an item
// @access  Public
router.get('/item/:itemId', getItemBids);

// @route   GET /api/bids/my-bids
// @desc    Get user's bids
// @access  Private
router.get('/my-bids', authMiddleware, getMyBids);

// @route   GET /api/bids/highest/:itemId
// @desc    Get highest bid for an item
// @access  Public
router.get('/highest/:itemId', getHighestBid);

// @route   DELETE /api/bids/:bidId
// @desc    Cancel bid
// @access  Private
router.delete('/:bidId', authMiddleware, cancelBid);

// @route   GET /api/bids/stats/:itemId
// @desc    Get bid statistics for an item
// @access  Public
router.get('/stats/:itemId', getBidStats);

module.exports = router;
