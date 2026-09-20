const express = require('express');
const router = express.Router();
const {
  createExamSlot,
  getAvailableSlots,
  getAllSlots,
  bookExamSlot
} = require('../controllers/examSlotController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  createExamSlotValidator,
  bookExamSlotValidator
} = require('../validators/examSlotValidator');

// All exam slot routes require authentication
router.use(protect);

// Admission team manages exam slots (create & list all)
router.post('/', requireRole('ADMISSION_TEAM'), createExamSlotValidator, createExamSlot);
router.get('/', requireRole('ADMISSION_TEAM'), getAllSlots);

// Authenticated users view available slots (for booking)
router.get('/available', getAvailableSlots);

// Parent books an exam slot for a student
router.post('/:slotId/book', requireRole('PARENT'), bookExamSlotValidator, bookExamSlot);

module.exports = router;
