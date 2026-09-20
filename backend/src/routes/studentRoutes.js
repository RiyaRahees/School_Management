const express = require('express');
const router = express.Router();
const {
  createStudent,
  getParentStudents,
  getStudentById,
  updateStudent,
  payRegistrationFee,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/studentController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  createStudentValidator,
  updateStudentValidator,
  studentIdValidator
} = require('../validators/studentValidator');

// All student routes require authentication
router.use(protect);

// Parent creates student application
router.post('/', requireRole('PARENT'), createStudentValidator, createStudent);

// Parent retrieves own students
router.get('/', requireRole('PARENT'), getParentStudents);

// Parent or Admission team views student by ID
router.get('/:id', studentIdValidator, getStudentById);

// Parent updates student application (only before fee payment)
router.put('/:id', requireRole('PARENT'), studentIdValidator, updateStudentValidator, updateStudent);

// Parent pays registration fee (Direct / Mock fallback)
router.post('/:id/pay-registration', requireRole('PARENT'), studentIdValidator, payRegistrationFee);

// Razorpay: Create Order
router.post('/:id/razorpay/create-order', requireRole('PARENT'), studentIdValidator, createRazorpayOrder);

// Razorpay: Verify Payment Signature
router.post('/:id/razorpay/verify', requireRole('PARENT'), studentIdValidator, verifyRazorpayPayment);

module.exports = router;
