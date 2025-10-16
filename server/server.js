const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const session = require('express-session');
const passport = require('./config/passport');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://bid2-nine.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));

// Import cron jobs for auction management
const { checkEndedAuctions, checkEndingSoon } = require('./utils/cronJobs');

// Schedule cron job to check for ended auctions every minute
cron.schedule('* * * * *', () => {
  checkEndedAuctions();
});

// Schedule cron job to check for auctions ending soon every 10 minutes
cron.schedule('*/10 * * * *', () => {
  checkEndingSoon();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'שגיאה פנימית בשרת',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'הנתיב לא נמצא' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auction-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('מחובר למסד הנתונים MongoDB');
})
.catch((error) => {
  console.error('שגיאה בחיבור למסד הנתונים:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`השרת פועל על פורט ${PORT}`);
});
