const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Create or update admin user
const createOrUpdateAdmin = async () => {
  try {
    const adminEmail = 'admin@auction.com';
    const adminPassword = 'admin123';
    
    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      // Update existing admin
      admin.role = 'admin';
      admin.isActive = true;
      admin.password = adminPassword; // This will be hashed by the pre-save middleware
      await admin.save();
      console.log('✅ מנהל קיים עודכן בהצלחה');
    } else {
      // Create new admin
      admin = await User.create({
        name: 'מנהל המערכת',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '050-1234567',
        address: 'תל אביב, ישראל',
        isActive: true
      });
      console.log('✅ מנהל חדש נוצר בהצלחה');
    }
    
    console.log('\n🔑 פרטי התחברות:');
    console.log(`   אימייל: ${admin.email}`);
    console.log(`   סיסמה: ${adminPassword}`);
    console.log(`   תפקיד: ${admin.role}`);
    console.log(`   פעיל: ${admin.isActive ? 'כן' : 'לא'}`);
    
    return admin;
  } catch (error) {
    console.error('שגיאה ביצירת/עדכון מנהל:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await createOrUpdateAdmin();
    console.log('\n✅ הסקריפט הושלם בהצלחה!');
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

module.exports = { createOrUpdateAdmin };
