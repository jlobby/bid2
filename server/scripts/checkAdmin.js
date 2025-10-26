const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
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

// Check admin user
const checkAdmin = async () => {
  try {
    const adminEmail = 'admin@auction.com';
    
    // Find admin user
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ מנהל לא נמצא במסד הנתונים');
      console.log('💡 הרץ: npm run create-admin');
      return false;
    }
    
    console.log('✅ מנהל נמצא במסד הנתונים:');
    console.log(`   שם: ${admin.name}`);
    console.log(`   אימייל: ${admin.email}`);
    console.log(`   תפקיד: ${admin.role}`);
    console.log(`   פעיל: ${admin.isActive ? 'כן' : 'לא'}`);
    console.log(`   נוצר: ${admin.createdAt}`);
    console.log(`   עודכן: ${admin.updatedAt}`);
    
    // Check if admin has correct role
    if (admin.role !== 'admin') {
      console.log('⚠️  למנהל אין תפקיד admin');
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      console.log('⚠️  המנהל לא פעיל');
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בבדיקת מנהל:', error);
    return false;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    const adminExists = await checkAdmin();
    
    if (adminExists) {
      console.log('\n✅ המנהל קיים ומוכן לשימוש');
    } else {
      console.log('\n❌ המנהל לא קיים - יש ליצור אותו');
    }
    
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

module.exports = { checkAdmin };
