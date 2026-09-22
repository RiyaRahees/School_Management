const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Student = require('../models/Student');
const ExamSlot = require('../models/ExamSlot');

const clearStudentsData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_admission';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB:', mongoose.connection.name);

    // 1. Delete all students
    const deleteResult = await Student.deleteMany({});
    console.log(`Successfully deleted ${deleteResult.deletedCount} student application record(s).`);

    // 2. Reset bookedCount on all exam slots
    const resetResult = await ExamSlot.updateMany({}, { $set: { bookedCount: 0 } });
    console.log(`Reset bookedCount to 0 for ${resetResult.modifiedCount} examination slot(s).`);

    console.log('Students data cleared successfully. Ready for fresh student records.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing student records:', err.message);
    process.exit(1);
  }
};

clearStudentsData();
