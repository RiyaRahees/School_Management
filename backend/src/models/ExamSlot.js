const mongoose = require('mongoose');

const examSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Exam date is required'],
      trim: true
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be greater than 0']
    },
    bookedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
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

const ExamSlot = mongoose.model('ExamSlot', examSlotSchema);

module.exports = ExamSlot;
