const { check, param } = require('express-validator');
const { validate } = require('./authValidator');

const createStudentValidator = [
  check('studentName')
    .trim()
    .notEmpty()
    .withMessage('Student name is required'),
  check('dateOfBirth')
    .trim()
    .notEmpty()
    .withMessage('Date of birth is required'),
  check('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  check('previousSchool')
    .optional()
    .trim(),
  check('applyingGrade')
    .trim()
    .notEmpty()
    .withMessage('Applying grade is required'),
  validate
];

const updateStudentValidator = [
  check('studentName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Student name cannot be empty'),
  check('dateOfBirth')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Date of birth cannot be empty'),
  check('gender')
    .optional()
    .trim()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  check('previousSchool')
    .optional()
    .trim(),
  check('applyingGrade')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Applying grade cannot be empty'),
  validate
];

const studentIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  validate
];

module.exports = {
  createStudentValidator,
  updateStudentValidator,
  studentIdValidator
};
