const { check, param } = require('express-validator');
const { validate } = require('./authValidator');

const createExamSlotValidator = [
  check('date')
    .trim()
    .notEmpty()
    .withMessage('Date is required')
    .custom((value) => {
      const inputDate = new Date(value);
      if (isNaN(inputDate.getTime())) {
        throw new Error('Invalid date format. Please provide a valid date.');
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        throw new Error('Exam date cannot be in the past. Please select an upcoming date.');
      }
      return true;
    }),
  check('startTime')
    .trim()
    .notEmpty()
    .withMessage('Start time is required'),
  check('endTime')
    .trim()
    .notEmpty()
    .withMessage('End time is required'),
  check('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be greater than 0'),
  validate
];

const bookExamSlotValidator = [
  param('slotId')
    .optional()
    .isMongoId()
    .withMessage('Invalid slot ID format'),
  check('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  validate
];

module.exports = {
  createExamSlotValidator,
  bookExamSlotValidator
};
