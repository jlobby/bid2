const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'שם הפריט הוא שדה חובה'],
    trim: true,
    maxlength: [100, 'שם הפריט לא יכול להיות יותר מ-100 תווים']
  },
  description: {
    type: String,
    required: [true, 'תיאור הפריט הוא שדה חובה'],
    trim: true,
    maxlength: [1000, 'התיאור לא יכול להיות יותר מ-1000 תווים']
  },
  images: [{
    type: String,
    required: true
  }],
  startPrice: {
    type: Number,
    required: [true, 'מחיר פתיחה הוא שדה חובה'],
    min: [0, 'מחיר הפתיחה לא יכול להיות שלילי']
  },
  currentPrice: {
    type: Number,
    default: function() {
      return this.startPrice;
    }
  },
  bidsCount: {
    type: Number,
    default: 0
  },
  minBidIncrement: {
    type: Number,
    default: 10
  },
  location: {
    type: String,
    required: [true, 'מיקום איסוף הוא שדה חובה'],
    trim: true
  },
  endDate: {
    type: Date,
    required: [true, 'תאריך סיום הוא שדה חובה'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'תאריך הסיום חייב להיות בעתיד'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'ended'],
    default: 'pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finalPrice: {
    type: Number
  },
  category: {
    type: String,
    enum: ['electronics', 'furniture', 'clothing', 'books', 'sports', 'jewelry', 'art', 'other'],
    default: 'other'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: [true, 'מצב הפריט הוא שדה חובה']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPaidPromotion: {
    type: Boolean,
    default: false
  },
  promotionStatus: {
    type: String,
    enum: ['free', 'paid_requested', 'paid_approved', 'paid_rejected'],
    default: 'free'
  },
  promotionPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
itemSchema.index({ status: 1, endDate: 1 });
itemSchema.index({ userId: 1 });
itemSchema.index({ category: 1 });

// Virtual for time remaining
itemSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;
  
  if (diff <= 0) return 'המכירה הסתיימה';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} ימים, ${hours} שעות`;
  if (hours > 0) return `${hours} שעות, ${minutes} דקות`;
  return `${minutes} דקות`;
});

// Ensure virtual fields are serialized
itemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
