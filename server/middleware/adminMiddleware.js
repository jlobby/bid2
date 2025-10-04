const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'אין הרשאה לגשת למשאב זה' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'אין הרשאה למשאב זה - נדרשת הרשאת מנהל' 
    });
  }

  next();
};

module.exports = adminMiddleware;

