const ExamSlot = require('../models/ExamSlot');
const Student = require('../models/Student');

// @desc    Create a new exam slot
// @route   POST /api/exam-slots
// @access  Private (ADMISSION_TEAM only)
const createExamSlot = async (req, res, next) => {
  try {
    const { date, startTime, endTime, capacity } = req.body;

    const parsedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    if (parsedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Exam date cannot be in the past. Please select an upcoming date.'
      });
    }

    const slot = await ExamSlot.create({
      date,
      startTime,
      endTime,
      capacity: Number(capacity),
      bookedCount: 0,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Exam slot created successfully',
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active exam slots that have available capacity and upcoming date
// @route   GET /api/exam-slots/available
// @access  Private (Authenticated users)
const getAvailableSlots = async (req, res, next) => {
  try {
    const slots = await ExamSlot.find({
      isActive: { $ne: false },
      $expr: { $lt: ['$bookedCount', '$capacity'] }
    }).sort({ date: 1, startTime: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter to only include upcoming / today's slots
    const upcomingSlots = slots.filter((slot) => {
      const slotDate = new Date(slot.date);
      return !isNaN(slotDate.getTime()) && slotDate >= today;
    });

    const data = upcomingSlots.map((slot) => ({
      id: slot._id,
      date: slot.date,
      startTime: slot.startTime || slot.time || '10:00 AM',
      endTime: slot.endTime || '',
      time: slot.time || (slot.startTime ? `${slot.startTime} – ${slot.endTime}` : '10:00 AM'),
      capacity: slot.capacity,
      bookedCount: slot.bookedCount || 0,
      availableSeats: slot.capacity - (slot.bookedCount || 0)
    }));

    return res.status(200).json({
      success: true,
      message: 'Available exam slots retrieved successfully',
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exam slots for Admission Team management
// @route   GET /api/exam-slots
// @access  Private (ADMISSION_TEAM only)
const getAllSlots = async (req, res, next) => {
  try {
    const slots = await ExamSlot.find().sort({ date: 1, startTime: 1 });

    const data = slots.map((slot) => ({
      id: slot._id,
      _id: slot._id,
      date: slot.date,
      startTime: slot.startTime || slot.time || '10:00 AM',
      endTime: slot.endTime || '',
      time: slot.time || (slot.startTime ? `${slot.startTime} – ${slot.endTime}` : '10:00 AM'),
      capacity: slot.capacity,
      bookedCount: slot.bookedCount || 0,
      availableSeats: Math.max(0, slot.capacity - (slot.bookedCount || 0)),
      isActive: slot.isActive !== false
    }));

    return res.status(200).json({
      success: true,
      message: 'All exam slots retrieved successfully',
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book an exam slot for a student
// @route   POST /api/exam-slots/:slotId/book
// @access  Private (PARENT only)
const bookExamSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const { studentId } = req.body;

    // 1. Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student application not found'
      });
    }

    // 2. Verify student belongs to logged-in parent
    if (student.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not own this student application'
      });
    }

    // 3 & 4. Verify registration fee is paid & status is REGISTRATION_FEE_PAID
    if (!student.registrationFeePaid || student.status !== 'REGISTRATION_FEE_PAID') {
      return res.status(400).json({
        success: false,
        message: 'Registration fee must be paid before booking an exam slot'
      });
    }

    // 5. Verify student does not already have an exam slot booked
    if (student.examSlotId) {
      return res.status(400).json({
        success: false,
        message: 'This student already has an exam slot booked'
      });
    }

    // 6. Verify exam slot exists
    const slot = await ExamSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Exam slot not found'
      });
    }

    // 7. Verify slot is active
    if (slot.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'This exam slot is no longer active'
      });
    }

    // 8. Verify slot has available capacity
    if (slot.bookedCount >= slot.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This exam slot is fully booked. Please select another slot.'
      });
    }

    // Update student and increment slot count
    student.examSlotId = slot._id;
    student.status = 'SLOT_BOOKED';
    slot.bookedCount += 1;

    await student.save();
    await slot.save();

    return res.status(200).json({
      success: true,
      message: 'Exam slot booked successfully',
      data: {
        studentId: student._id,
        examSlotId: slot._id,
        slotDetails: {
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime
        },
        status: student.status
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExamSlot,
  getAvailableSlots,
  getAllSlots,
  bookExamSlot
};
