const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Date of birth is required'],
      trim: true
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other']
    },
    previousSchool: {
      type: String,
      trim: true,
      default: ''
    },
    applyingGrade: {
      type: String,
      required: [true, 'Applying grade is required'],
      trim: true
    },
    status: {
      type: String,
      enum: [
        'APPLICATION_CREATED',
        'REGISTRATION_FEE_PAID',
        'SLOT_BOOKED',
        'EXAM_COMPLETED',
        'ADMISSION_COMPLETED'
      ],
      default: 'APPLICATION_CREATED'
    },
    registrationFeePaid: {
      type: Boolean,
      default: false
    },
    registrationFeeAmount: {
      type: Number,
      default: 0
    },
    registrationPaidAt: {
      type: Date,
      default: null
    },
    examSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSlot',
      default: null
    },
    examScore: {
      type: Number,
      default: null
    },
    examCompletedAt: {
      type: Date,
      default: null
    },
    assignedCourse: {
      type: String,
      default: null
    },
    courseAssignedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
