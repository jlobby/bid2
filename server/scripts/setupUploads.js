const fs = require('fs');
const path = require('path');

// Setup uploads directory
const setupUploads = () => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 יוצר תיקיית uploads...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ תיקיית uploads נוצרה בהצלחה');
    } else {
      console.log('✅ תיקיית uploads כבר קיימת');
    }
    
    // Check permissions
    try {
      const testFile = path.join(uploadsDir, 'test.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ הרשאות כתיבה תקינות');
    } catch (error) {
      console.log('❌ בעיה בהרשאות כתיבה:', error.message);
    }
    
    console.log(`📂 נתיב תיקיית uploads: ${uploadsDir}`);
    
    return true;
  } catch (error) {
    console.error('❌ שגיאה בהגדרת תיקיית uploads:', error);
    return false;
  }
};

// Main function
const main = () => {
  console.log('🔧 מגדיר תיקיית uploads...');
  const success = setupUploads();
  
  if (success) {
    console.log('\n✅ ההגדרה הושלמה בהצלחה!');
  } else {
    console.log('\n❌ ההגדרה נכשלה');
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupUploads };
