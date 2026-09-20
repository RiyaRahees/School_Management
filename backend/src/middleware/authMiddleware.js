const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to req.user
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Expect: Bearer TOKEN
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecretjwtkey_school_admission_2026'
    );

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token'
    });
  }
};

// Check if user has required role (e.g. 'PARENT' or 'ADMISSION_TEAM')
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this resource'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  requireRole
};
