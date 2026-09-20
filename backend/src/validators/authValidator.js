const { check, validationResult } = require('express-validator');

// Common validation handler returning the exact specified format
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const registerValidator = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidator = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  check('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

module.exports = {
  registerValidator,
  loginValidator,
  validate
};
