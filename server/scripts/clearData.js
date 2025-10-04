const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Item = require('../models/Item');
const Bid = require('../models/Bid');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auction-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('מחובר למסד הנתונים MongoDB');
  } catch (error) {
    console.error('שגיאה בחיבור למסד הנתונים:', error);
    process.exit(1);
  }
};

// Clear all data
const clearAllData = async () => {
  try {
    console.log('מתחיל למחוק נתונים...');
    
    // Delete all items
    const deletedItems = await Item.deleteMany({});
    console.log(`נמחקו ${deletedItems.deletedCount} פריטים`);
    
    // Delete all bids
    const deletedBids = await Bid.deleteMany({});
    console.log(`נמחקו ${deletedBids.deletedCount} הצעות`);
    
    // Delete all users except admin
    const deletedUsers = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`נמחקו ${deletedUsers.deletedCount} משתמשים`);
    
    console.log('\n✅ כל הנתונים נמחקו בהצלחה!');
    console.log('האתר עכשיו ריק ממודעות דמה');
    
    process.exit(0);
  } catch (error) {
    console.error('שגיאה במחיקת נתונים:', error);
    process.exit(1);
  }
};

// Run clear if called directly
if (require.main === module) {
  connectDB().then(() => {
    clearAllData();
  });
}

module.exports = clearAllData;
