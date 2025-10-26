const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'סכום ההצעה הוא שדה חובה'],
    min: [0, 'סכום ההצעה לא יכול להיות שלילי']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
bidSchema.index({ itemId: 1, amount: -1 });
bidSchema.index({ userId: 1 });
bidSchema.index({ createdAt: -1 });

// Ensure only one winning bid per item
bidSchema.pre('save', async function(next) {
  if (this.isWinning) {
    // Remove winning status from other bids for this item
    await this.constructor.updateMany(
      { itemId: this.itemId, _id: { $ne: this._id } },
      { isWinning: false }
    );
  }
  next();
});

module.exports = mongoose.model('Bid', bidSchema);


