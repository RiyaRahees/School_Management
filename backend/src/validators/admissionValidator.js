const { check, param } = require('express-validator');
const { validate } = require('./authValidator');

const updateScoreValidator = [
  param('studentId')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  check('score')
    .notEmpty()
    .withMessage('Score is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  validate
];

const assignCourseValidator = [
  param('studentId')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  check('course')
    .trim()
    .notEmpty()
    .withMessage('Course is required')
    .isIn(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'])
    .withMessage('Course must be one of: Grade 1, Grade 2, Grade 3, Grade 4'),
  validate
];

module.exports = {
  updateScoreValidator,
  assignCourseValidator
};
