const Student = require('../models/Student');
const ExamSlot = require('../models/ExamSlot');
const User = require('../models/User');

// @desc    Create a new student application
// @route   POST /api/students
// @access  Private (PARENT only)
const createStudent = async (req, res, next) => {
  try {
    const { studentName, dateOfBirth, gender, previousSchool, applyingGrade } = req.body;

    // parentId and status are strictly controlled by the backend
    const student = await Student.create({
      parentId: req.user._id,
      studentName,
      dateOfBirth,
      gender,
      previousSchool: previousSchool || '',
      applyingGrade,
      status: 'APPLICATION_CREATED',
      registrationFeePaid: false
    });

    return res.status(201).json({
      success: true,
      message: 'Student application created successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students belonging to the logged-in parent
// @route   GET /api/students
// @access  Private (PARENT only)
const getParentStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ parentId: req.user._id })
      .populate('examSlotId', 'date startTime endTime')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student details by ID (parent views own, admission team views any)
// @route   GET /api/students/:id
// @access  Private (Authenticated)
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('parentId', 'name email')
      .populate('examSlotId', 'date startTime endTime');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student application not found'
      });
    }

    // Role check: parent can only access their own student
    const isOwner = student.parentId._id.toString() === req.user._id.toString();
    if (req.user.role === 'PARENT' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not have permission to view this student application'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student application retrieved successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit student details before fee payment
// @route   PUT /api/students/:id
// @access  Private (PARENT only)
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student application not found'
      });
    }

    // Verify parent ownership
    if (student.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not own this student application'
      });
    }

    // Cannot edit once registration fee is paid
    if (student.status !== 'APPLICATION_CREATED' || student.registrationFeePaid) {
      return res.status(400).json({
        success: false,
        message: 'Student details cannot be edited after registration fee payment'
      });
    }

    const { studentName, dateOfBirth, gender, previousSchool, applyingGrade } = req.body;

    if (studentName !== undefined) student.studentName = studentName;
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
    if (gender !== undefined) student.gender = gender;
    if (previousSchool !== undefined) student.previousSchool = previousSchool;
    if (applyingGrade !== undefined) student.applyingGrade = applyingGrade;

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student application updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

const crypto = require('crypto');
const Razorpay = require('razorpay');

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// @desc    Create Razorpay Order for Student Registration Fee
// @route   POST /api/students/:id/razorpay/create-order
// @access  Private (PARENT only)
const createRazorpayOrder = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student application not found'
      });
    }

    if (student.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not own this student application'
      });
    }

    if (student.registrationFeePaid || student.status !== 'APPLICATION_CREATED') {
      return res.status(400).json({
        success: false,
        message: 'Registration fee has already been paid for this application'
      });
    }

    const feeAmount = Number(process.env.REGISTRATION_FEE) || 500;
    const razorpay = getRazorpayInstance();

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay payment gateway is not configured on server'
      });
    }

    const options = {
      amount: feeAmount * 100, // in paise
      currency: 'INR',
      receipt: `rcpt_${student._id.toString().slice(-8)}_${Date.now()}`,
      notes: {
        studentId: student._id.toString(),
        studentName: student.studentName,
        parentEmail: req.user.email
      }
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        studentName: student.studentName,
        studentGrade: student.applyingGrade,
        parentName: req.user.name,
        parentEmail: req.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & confirm registration
// @route   POST /api/students/:id/razorpay/verify
// @access  Private (PARENT only)
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student application not found'
      });
    }

    if (student.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not own this student application'
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification parameters missing'
      });
    }

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature'
      });
    }

    const feeAmount = Number(process.env.REGISTRATION_FEE) || 500;

    student.registrationFeePaid = true;
    student.registrationFeeAmount = feeAmount;
    student.registrationPaidAt = new Date();
    student.status = 'REGISTRATION_FEE_PAID';

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified and registration fee confirmed successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay registration fee (Mock / Direct fallback)
// @route   POST /api/students/:id/pay-registration
// @access  Private (PARENT only)
const payRegistrationFee = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student application not found'
      });
    }

    if (student.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not own this student application'
      });
    }

    if (student.registrationFeePaid || student.status !== 'APPLICATION_CREATED') {
      return res.status(400).json({
        success: false,
        message: 'Registration fee has already been paid for this application'
      });
    }

    const feeAmount = Number(process.env.REGISTRATION_FEE) || 500;

    student.registrationFeePaid = true;
    student.registrationFeeAmount = feeAmount;
    student.registrationPaidAt = new Date();
    student.status = 'REGISTRATION_FEE_PAID';

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Registration fee paid successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getParentStudents,
  getStudentById,
  updateStudent,
  payRegistrationFee,
  createRazorpayOrder,
  verifyRazorpayPayment
};
