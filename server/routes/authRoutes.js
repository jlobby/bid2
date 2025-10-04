const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  googleAuth,
  googleCallback,
  googleSuccess
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('שם הוא שדה חובה')
    .isLength({ max: 50 })
    .withMessage('השם לא יכול להיות יותר מ-50 תווים'),
  body('email')
    .isEmail()
    .withMessage('אנא הזן כתובת אימייל תקינה')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('הסיסמה חייבת להיות לפחות 6 תווים'),
  body('phone')
    .optional()
    .isMobilePhone('he-IL')
    .withMessage('אנא הזן מספר טלפון תקין'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('הכתובת לא יכולה להיות יותר מ-200 תווים')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('אנא הזן כתובת אימייל תקינה')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('סיסמה היא שדה חובה')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('שם לא יכול להיות ריק')
    .isLength({ max: 50 })
    .withMessage('השם לא יכול להיות יותר מ-50 תווים'),
  body('phone')
    .optional()
    .isMobilePhone('he-IL')
    .withMessage('אנא הזן מספר טלפון תקין'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('הכתובת לא יכולה להיות יותר מ-200 תווים')
];

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, updateProfileValidation, updateProfile);

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ 
      message: 'Google OAuth לא מוגדר. אנא הגדר GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET' 
    });
  }
  googleAuth(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_oauth_not_configured`);
  }
  googleCallback(req, res, next);
});

// @route   GET /api/auth/google/success
// @desc    Google OAuth success
// @access  Private
router.get('/google/success', authMiddleware, googleSuccess);

module.exports = router;
