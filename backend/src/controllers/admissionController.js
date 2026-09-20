const Student = require('../models/Student');
const ExamSlot = require('../models/ExamSlot');
const User = require('../models/User');

// @desc    Get all student applications with pagination and optional status filter
// @route   GET /api/admissions
// @access  Private (ADMISSION_TEAM only)
const getAllApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== 'ALL') {
      filter.status = req.query.status;
    }

    const total = await Student.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 0;

    const students = await Student.find(filter)
      .populate('parentId', 'name email')
      .populate('examSlotId', 'date startTime endTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with status ADMISSION_COMPLETED
// @route   GET /api/admissions/completed
// @access  Private (ADMISSION_TEAM only)
const getCompletedAdmissions = async (req, res, next) => {
  try {
    const students = await Student.find({ status: 'ADMISSION_COMPLETED' })
      .populate('parentId', 'name email')
      .populate('examSlotId', 'date startTime endTime')
      .sort({ courseAssignedAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Completed admissions retrieved successfully',
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam score for a student (status must be SLOT_BOOKED)
// @route   PATCH /api/admissions/:studentId/exam-score
// @access  Private (ADMISSION_TEAM only)
const updateExamScore = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { score } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student application not found'
      });
    }

    // Workflow rule: score can only be entered after slot booking
    if (student.status !== 'SLOT_BOOKED') {
      return res.status(400).json({
        success: false,
        message: `Cannot update exam score before slot booking. Current application status is '${student.status}'.`
      });
    }

    student.examScore = Number(score);
    student.examCompletedAt = new Date();
    student.status = 'EXAM_COMPLETED';

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Exam score updated successfully',
      data: {
        studentId: student._id,
        examScore: student.examScore,
        examCompletedAt: student.examCompletedAt,
        status: student.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign course to student (status must be EXAM_COMPLETED)
// @route   PATCH /api/admissions/:studentId/course
// @access  Private (ADMISSION_TEAM only)
const assignCourse = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { course } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student application not found'
      });
    }

    // Workflow rule: course can only be assigned after exam is completed
    if (student.status !== 'EXAM_COMPLETED') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign course before exam completion. Current application status is '${student.status}'.`
      });
    }

    student.assignedCourse = course;
    student.courseAssignedAt = new Date();
    student.status = 'ADMISSION_COMPLETED';

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Course assigned and admission completed successfully',
      data: {
        studentId: student._id,
        assignedCourse: student.assignedCourse,
        courseAssignedAt: student.courseAssignedAt,
        status: student.status
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllApplications,
  getCompletedAdmissions,
  updateExamScore,
  assignCourse
};
