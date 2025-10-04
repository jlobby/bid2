# אפליקציית מכירות פומביות

אפליקציית ווב למכירות פומביות של פריטי יד שנייה, בנויה עם React + Tailwind בפרונטאנד ו-Node.js + Express + MongoDB בבקאנד.

## 🚀 תכונות

### למשתמשים
- **הרשמה והתחברות** - מערכת אימות JWT מלאה + Google OAuth
- **העלאת פריטים** - העלה פריטים למכירה עם תמונות ופרטים
- **מערכת מכירות פומביות** - הצעות מחיר בזמן אמת, מחיר נוכחי, זמן נותר
- **דשבורד אישי** - ניהול הפריטים וההצעות שלך
- **חיפוש וסינון** - חפש פריטים לפי קטגוריה, מחיר ועוד
- **שיתוף מתקדם** - שתף פריטים ב-WhatsApp, Facebook, Telegram, Twitter, LinkedIn
- **סטטיסטיקות הצעות** - צפייה בסטטיסטיקות מפורטות של ההצעות

### למנהלים
- **פאנל ניהול** - אישור/דחייה של פריטים ממתינים
- **מעקב מכירות** - צפייה בכל הפעילות והסטטיסטיקות
- **ניהול משתמשים** - מעקב אחר משתמשים ופעילותם

### אוטומציה
- **סיום מכירות** - Cron Job שסוגר מכירות אוטומטית
- **התראות אימייל** - שליחת הודעות למוכרים וקונים
- **מעקב מכירות מסתיימות** - התראות על מכירות שמסתיימות בקרוב

## 🛠️ טכנולוגיות

### Frontend
- **React 18** - ספריית UI
- **Tailwind CSS** - עיצוב רספונסיבי
- **React Router** - ניווט
- **Axios** - קריאות API
- **React Toastify** - התראות
- **date-fns** - עיבוד תאריכים

### Backend
- **Node.js** - סביבת ריצה
- **Express** - מסגרת ווב
- **MongoDB** - מסד נתונים
- **Mongoose** - ODM
- **JWT** - אימות
- **Passport.js** - אימות OAuth
- **Google OAuth 2.0** - התחברות עם Google
- **Multer** - העלאת קבצים
- **Nodemailer** - שליחת אימיילים
- **node-cron** - משימות מתוזמנות

## 📦 התקנה מהירה

### דרישות מקדימות
- Node.js (גרסה 16 ומעלה)
- MongoDB
- npm

### שלבי התקנה

1. **שכפל את הפרויקט**
```bash
git clone <repository-url>
cd auction-app
```

2. **התקן את כל התלויות**
```bash
npm run install-all
```

3. **הגדר משתני סביבה**
```bash
# העתק את קבצי הדוגמה
cp server/env.example server/.env
cp client/env.example client/.env

# ערוך את הקבצים עם הנתונים שלך
nano server/.env
nano client/.env
```

4. **זרע את מסד הנתונים (אופציונלי)**
```bash
cd server && npm run seed
```

5. **הפעל את האפליקציה**
```bash
npm run dev
```

האפליקציה תהיה זמינה ב:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 🔑 פרטי התחברות (אחרי זריעה)
- **מנהל**: admin@auction.com / admin123
- **משתמש**: yossi@example.com / password123

## ⚙️ הגדרת משתני סביבה

### server/.env
```env
# Database
MONGODB_URI=mongodb://localhost:27017/auction-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### client/.env
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🗂️ מבנה הפרויקט

```
auction-app/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # קומפוננטות React
│   │   ├── pages/          # דפי האפליקציה
│   │   ├── contexts/       # Context API
│   │   ├── services/       # שירותי API
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js Backend
│   ├── controllers/        # קונטרולרים
│   ├── middleware/         # מידלוור
│   ├── models/            # מודלי MongoDB
│   ├── routes/            # ראוטים
│   ├── utils/             # כלי עזר
│   ├── uploads/           # קבצים מועלים
│   └── server.js
└── package.json
```

## 🚀 הפעלה

### פיתוח
```bash
# הפעל את כל האפליקציה
npm run dev

# או הפעל בנפרד
npm run server  # Backend בלבד
npm run client  # Frontend בלבד
```

### ייצור
```bash
# בנה את ה-Frontend
cd client && npm run build

# הפעל את ה-Backend
cd server && npm start
```

## 📱 שימוש

### משתמש רגיל
1. הירשם/התחבר
2. העלה פריט למכירה
3. חפש פריטים להציע עליהם
4. נהל את הפריטים וההצעות שלך בדשבורד

### מנהל
1. התחבר עם חשבון מנהל
2. עבור לפאנל הניהול
3. אשר/דחה פריטים ממתינים

## 🔧 API Endpoints

### אימות
- `POST /api/auth/register` - הרשמה
- `POST /api/auth/login` - התחברות
- `GET /api/auth/me` - פרטי משתמש נוכחי
- `PUT /api/auth/profile` - עדכון פרופיל
- `GET /api/auth/google` - התחברות עם Google
- `GET /api/auth/google/callback` - callback של Google

### פריטים
- `GET /api/items` - קבלת פריטים
- `GET /api/items/:id` - פריט בודד
- `POST /api/items` - יצירת פריט
- `PUT /api/items/:id` - עדכון פריט
- `DELETE /api/items/:id` - מחיקת פריט
- `GET /api/items/my-items` - הפריטים שלי
- `PUT /api/items/:id/approve` - אישור פריט (מנהל)
- `PUT /api/items/:id/reject` - דחיית פריט (מנהל)

### הצעות
- `POST /api/bids` - יצירת הצעה
- `GET /api/bids/item/:itemId` - הצעות לפריט
- `GET /api/bids/my-bids` - ההצעות שלי
- `GET /api/bids/highest/:itemId` - ההצעה הגבוהה
- `GET /api/bids/stats/:itemId` - סטטיסטיקות הצעות
- `DELETE /api/bids/:bidId` - ביטול הצעה

## 🎨 עיצוב

האפליקציה משתמשת ב-Tailwind CSS עם עיצוב רספונסיבי מלא ותמיכה בעברית (RTL).

### צבעים
- Primary: כחול (#3b82f6)
- Secondary: אפור (#64748b)
- Success: ירוק (#10b981)
- Warning: צהוב (#f59e0b)
- Error: אדום (#ef4444)

## 🔒 אבטחה

- אימות JWT
- הצפנת סיסמאות עם bcrypt
- ולידציה של נתונים
- הגבלת גודל קבצים
- סינון קבצים

## 🚀 פריסה

### Heroku
1. צור אפליקציה ב-Heroku
2. הוסף MongoDB Atlas
3. הגדר משתני סביבה
4. פרוס את הקוד

### Vercel (Frontend)
1. חבר את הפרויקט ל-GitHub
2. פרוס ב-Vercel
3. הגדר משתני סביבה

## 🤝 תרומה

1. Fork את הפרויקט
2. צור branch חדש
3. Commit את השינויים
4. Push ל-branch
5. פתח Pull Request

## 📄 רישיון

MIT License - ראה קובץ LICENSE לפרטים.

---

**נבנה עם ❤️ בישראל**
