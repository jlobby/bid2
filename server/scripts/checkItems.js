const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Item = require('../models/Item');
const User = require('../models/User');

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

// Check items in database
const checkItems = async () => {
  try {
    console.log('\n🔍 בודק פריטים במסד הנתונים...');
    
    // Get all items
    const items = await Item.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    
    console.log(`📊 נמצאו ${items.length} פריטים במסד הנתונים\n`);
    
    items.forEach((item, index) => {
      console.log(`--- פריט ${index + 1} ---`);
      console.log(`ID: ${item._id}`);
      console.log(`שם: ${item.name}`);
      console.log(`סטטוס: ${item.status}`);
      console.log(`תמונות (${item.images.length}):`);
      item.images.forEach((image, imgIndex) => {
        console.log(`  ${imgIndex + 1}. ${image}`);
      });
      console.log(`נוצר: ${item.createdAt}`);
      console.log(`משתמש: ${item.userId?.name} (${item.userId?.email})`);
      console.log('');
    });
    
    // Check for items with no images
    const itemsWithoutImages = items.filter(item => !item.images || item.images.length === 0);
    if (itemsWithoutImages.length > 0) {
      console.log(`⚠️  נמצאו ${itemsWithoutImages.length} פריטים ללא תמונות:`);
      itemsWithoutImages.forEach(item => {
        console.log(`  - ${item.name} (${item._id})`);
      });
    }
    
    return items;
  } catch (error) {
    console.error('שגיאה בבדיקת פריטים:', error);
    return [];
  }
};

// Check recent items (last 24 hours)
const checkRecentItems = async () => {
  try {
    console.log('\n🕐 בודק פריטים מהשעות האחרונות...');
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentItems = await Item.find({ 
      createdAt: { $gte: yesterday } 
    }).populate('userId', 'name email').sort({ createdAt: -1 });
    
    console.log(`📅 נמצאו ${recentItems.length} פריטים מהשעות האחרונות\n`);
    
    recentItems.forEach((item, index) => {
      console.log(`--- פריט חדש ${index + 1} ---`);
      console.log(`שם: ${item.name}`);
      console.log(`סטטוס: ${item.status}`);
      console.log(`תמונות: ${item.images.length}`);
      if (item.images.length > 0) {
        console.log(`תמונה ראשונה: ${item.images[0]}`);
      }
      console.log(`נוצר: ${item.createdAt}`);
      console.log('');
    });
    
    return recentItems;
  } catch (error) {
    console.error('שגיאה בבדיקת פריטים חדשים:', error);
    return [];
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await checkItems();
    await checkRecentItems();
    
    console.log('\n✅ הבדיקה הושלמה');
    process.exit(0);
  } catch (error) {
    console.error('שגיאה בסקריפט:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkItems, checkRecentItems };
