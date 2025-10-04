const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Item.deleteMany({});
    await Bid.deleteMany({});
    console.log('נתונים קיימים נמחקו');
  } catch (error) {
    console.error('שגיאה במחיקת נתונים קיימים:', error);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    const admin = await User.create({
      name: 'מנהל המערכת',
      email: 'admin@auction.com',
      password: 'admin123',
      role: 'admin',
      phone: '050-1234567',
      address: 'תל אביב, ישראל'
    });
    console.log('מנהל נוצר:', admin.email);
    return admin;
  } catch (error) {
    console.error('שגיאה ביצירת מנהל:', error);
  }
};

// Create regular users
const createUsers = async () => {
  try {
    const users = await User.create([
      {
        name: 'יוסי כהן',
        email: 'yossi@example.com',
        password: 'password123',
        phone: '050-1111111',
        address: 'ירושלים, ישראל'
      },
      {
        name: 'שרה לוי',
        email: 'sara@example.com',
        password: 'password123',
        phone: '050-2222222',
        address: 'חיפה, ישראל'
      },
      {
        name: 'דוד ישראלי',
        email: 'david@example.com',
        password: 'password123',
        phone: '050-3333333',
        address: 'באר שבע, ישראל'
      },
      {
        name: 'מיכל רוזן',
        email: 'michal@example.com',
        password: 'password123',
        phone: '050-4444444',
        address: 'נתניה, ישראל'
      },
      {
        name: 'אבי גולד',
        email: 'avi@example.com',
        password: 'password123',
        phone: '050-5555555',
        address: 'אשדוד, ישראל'
      }
    ]);
    console.log(`${users.length} משתמשים נוצרו`);
    return users;
  } catch (error) {
    console.error('שגיאה ביצירת משתמשים:', error);
  }
};

// Create sample items
const createItems = async (users) => {
  try {
    const now = new Date();
    const items = await Item.create([
      {
        name: 'iPhone 13 Pro Max',
        description: 'iPhone 13 Pro Max במצב מעולה, 256GB, צבע כחול. כולל מטען מקורי, אוזניות וקופסה מקורית. שימוש קל בלבד.',
        images: ['/placeholder-phone.jpg'],
        startPrice: 2500,
        currentPrice: 2500,
        location: 'תל אביב',
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        category: 'electronics',
        condition: 'excellent',
        status: 'approved',
        userId: users[0]._id,
        bidsCount: 0
      },
      {
        name: 'ספה 3 מושבים',
        description: 'ספה נוחה 3 מושבים בצבע אפור, מצב טוב. מתאימה לסלון או חדר משפחה. איסוף עצמי.',
        images: ['/placeholder-sofa.jpg'],
        startPrice: 800,
        currentPrice: 800,
        location: 'חיפה',
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        category: 'furniture',
        condition: 'good',
        status: 'approved',
        userId: users[1]._id,
        bidsCount: 0
      },
      {
        name: 'ספרי לימוד אוניברסיטה',
        description: 'אוסף ספרי לימוד למדעי המחשב, שנה א-ב. מצב מעולה, ללא סימונים. כולל: מבני נתונים, אלגוריתמים, מתמטיקה דיסקרטית.',
        images: ['/placeholder-books.jpg'],
        startPrice: 200,
        currentPrice: 200,
        location: 'ירושלים',
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        category: 'books',
        condition: 'excellent',
        status: 'approved',
        userId: users[2]._id,
        bidsCount: 0
      },
      {
        name: 'אופני כביש',
        description: 'אופני כביש מקצועיים, מותג Giant. מצב מעולה, שימוש קל. כולל קסדה, כפפות וכלי עבודה.',
        images: ['/placeholder-bike.jpg'],
        startPrice: 1200,
        currentPrice: 1200,
        location: 'באר שבע',
        endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        category: 'sports',
        condition: 'excellent',
        status: 'approved',
        userId: users[3]._id,
        bidsCount: 0
      },
      {
        name: 'שעון יד יוקרתי',
        description: 'שעון יד מותג Fossil, צבע שחור. מצב מעולה, כולל קופסה מקורית ומסמכים. מתנה מושלמת.',
        images: ['/placeholder-watch.jpg'],
        startPrice: 400,
        currentPrice: 400,
        location: 'נתניה',
        endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        category: 'jewelry',
        condition: 'excellent',
        status: 'approved',
        userId: users[4]._id,
        bidsCount: 0
      },
      {
        name: 'מחשב נייד Dell',
        description: 'מחשב נייד Dell Inspiron, 15.6 אינץ, 8GB RAM, 256GB SSD. מצב טוב, מתאים לעבודה וללימודים.',
        images: ['/placeholder-laptop.jpg'],
        startPrice: 1800,
        currentPrice: 1800,
        location: 'אשדוד',
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        category: 'electronics',
        condition: 'good',
        status: 'approved',
        userId: users[0]._id,
        bidsCount: 0
      },
      {
        name: 'ציור שמן מקורי',
        description: 'ציור שמן מקורי של נוף ישראלי, 40x30 ס"מ. חתום על ידי האמן. מתאים לעיצוב הבית.',
        images: ['/placeholder-painting.jpg'],
        startPrice: 600,
        currentPrice: 600,
        location: 'תל אביב',
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        category: 'art',
        condition: 'excellent',
        status: 'approved',
        userId: users[1]._id,
        bidsCount: 0
      },
      {
        name: 'מעיל חורף',
        description: 'מעיל חורף חם ונוח, מותג Zara, גודל M. צבע שחור, מצב מעולה. מתאים לגברים ונשים.',
        images: ['/placeholder-coat.jpg'],
        startPrice: 150,
        currentPrice: 150,
        location: 'חיפה',
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        category: 'clothing',
        condition: 'excellent',
        status: 'approved',
        userId: users[2]._id,
        bidsCount: 0
      }
    ]);
    console.log(`${items.length} פריטים נוצרו`);
    return items;
  } catch (error) {
    console.error('שגיאה ביצירת פריטים:', error);
  }
};

// Create sample bids
const createBids = async (items, users) => {
  try {
    const bids = [];
    
    // Create bids for first item (iPhone)
    bids.push(await Bid.create({
      amount: 2600,
      userId: users[1]._id,
      itemId: items[0]._id,
      isWinning: true
    }));
    
    bids.push(await Bid.create({
      amount: 2700,
      userId: users[2]._id,
      itemId: items[0]._id,
      isWinning: true
    }));
    
    bids.push(await Bid.create({
      amount: 2800,
      userId: users[3]._id,
      itemId: items[0]._id,
      isWinning: true
    }));

    // Create bids for second item (sofa)
    bids.push(await Bid.create({
      amount: 850,
      userId: users[0]._id,
      itemId: items[1]._id,
      isWinning: true
    }));
    
    bids.push(await Bid.create({
      amount: 900,
      userId: users[2]._id,
      itemId: items[1]._id,
      isWinning: true
    }));

    // Create bids for third item (books)
    bids.push(await Bid.create({
      amount: 220,
      userId: users[0]._id,
      itemId: items[2]._id,
      isWinning: true
    }));

    // Update items with current prices and bid counts
    await Item.findByIdAndUpdate(items[0]._id, { 
      currentPrice: 2800, 
      bidsCount: 3 
    });
    
    await Item.findByIdAndUpdate(items[1]._id, { 
      currentPrice: 900, 
      bidsCount: 2 
    });
    
    await Item.findByIdAndUpdate(items[2]._id, { 
      currentPrice: 220, 
      bidsCount: 1 
    });

    console.log(`${bids.length} הצעות נוצרו`);
    return bids;
  } catch (error) {
    console.error('שגיאה ביצירת הצעות:', error);
  }
};

// Main seed function
const seed = async () => {
  try {
    await connectDB();
    await clearData();
    
    const admin = await createAdmin();
    const users = await createUsers();
    const items = await createItems(users);
    const bids = await createBids(items, users);
    
    console.log('\n✅ מסד הנתונים נזרע בהצלחה!');
    console.log(`📊 נוצרו:`);
    console.log(`   - 1 מנהל`);
    console.log(`   - ${users.length} משתמשים`);
    console.log(`   - ${items.length} פריטים`);
    console.log(`   - ${bids.length} הצעות`);
    console.log('\n🔑 פרטי התחברות:');
    console.log('   מנהל: admin@auction.com / admin123');
    console.log('   משתמש: yossi@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('שגיאה בזריעת מסד הנתונים:', error);
    process.exit(1);
  }
};

// Run seed if called directly
if (require.main === module) {
  seed();
}

module.exports = seed;

