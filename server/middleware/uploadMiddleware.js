const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 תיקיית uploads נוצרה');
  }
};

// Initialize uploads directory
ensureUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('רק קבצי תמונה מותרים'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'קובץ התמונה גדול מדי. הגודל המקסימלי הוא 5MB' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'יותר מדי קבצים. המקסימום הוא 5 תמונות' 
      });
    }
  }
  
  if (error.message === 'רק קבצי תמונה מותרים') {
    return res.status(400).json({ 
      message: 'רק קבצי תמונה מותרים' 
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  handleUploadError
};


