const mongoose = require('mongoose');
const User = require('../models/User');
const ExamSlot = require('../models/ExamSlot');

// Automatic seed to ensure admin and exam slots exist on production Atlas database
const autoSeed = async () => {
  try {
    // 1. Seed Primary Admin
    const adminUser = await User.findOne({ email: 'admin@school.com' });
    if (!adminUser) {
      await User.create({
        name: 'Admission Office Head',
        email: 'admin@school.com',
        password: 'admin123',
        role: 'ADMISSION_TEAM'
      });
      console.log('Auto-seeded ADMISSION_TEAM: admin@school.com / admin123');
    }

    // 2. Seed Secondary Admin
    const altAdmin = await User.findOne({ email: 'admission@school.com' });
    if (!altAdmin) {
      await User.create({
        name: 'Admission Officer',
        email: 'admission@school.com',
        password: 'admin123',
        role: 'ADMISSION_TEAM'
      });
      console.log('Auto-seeded secondary ADMISSION_TEAM: admission@school.com / admin123');
    }

    // 3. Seed Parent Users
    const parent1 = await User.findOne({ email: 'riyarahees136@gmail.com' });
    if (!parent1) {
      await User.create({
        name: 'Riya Rahees',
        email: 'riyarahees136@gmail.com',
        password: '123123',
        role: 'PARENT'
      });
      console.log('Auto-seeded PARENT: riyarahees136@gmail.com / 123123');
    }

    const parent2 = await User.findOne({ email: 'parent@example.com' });
    if (!parent2) {
      await User.create({
        name: 'Demo Parent',
        email: 'parent@example.com',
        password: 'password123',
        role: 'PARENT'
      });
      console.log('Auto-seeded PARENT: parent@example.com / password123');
    }

    // 4. Seed Exam Slots if collection is empty
    const slotCount = await ExamSlot.countDocuments();
    if (slotCount === 0) {
      const defaultSlots = [
        { date: '24 September 2026', startTime: '09:00 AM', endTime: '10:30 AM', capacity: 30, bookedCount: 0, isActive: true },
        { date: '24 September 2026', startTime: '11:00 AM', endTime: '12:30 PM', capacity: 30, bookedCount: 0, isActive: true },
        { date: '24 September 2026', startTime: '02:00 PM', endTime: '03:30 PM', capacity: 30, bookedCount: 0, isActive: true },
        { date: '25 September 2026', startTime: '09:00 AM', endTime: '10:30 AM', capacity: 30, bookedCount: 0, isActive: true },
        { date: '25 September 2026', startTime: '11:00 AM', endTime: '12:30 PM', capacity: 30, bookedCount: 0, isActive: true },
        { date: '25 September 2026', startTime: '02:00 PM', endTime: '03:30 PM', capacity: 30, bookedCount: 0, isActive: true },
        { date: '28 September 2026', startTime: '10:00 AM', endTime: '11:30 AM', capacity: 35, bookedCount: 0, isActive: true },
        { date: '28 September 2026', startTime: '02:00 PM', endTime: '03:30 PM', capacity: 35, bookedCount: 0, isActive: true },
        { date: '30 September 2026', startTime: '10:00 AM', endTime: '11:30 AM', capacity: 40, bookedCount: 0, isActive: true },
        { date: '03 October 2026', startTime: '10:00 AM', endTime: '11:30 AM', capacity: 40, bookedCount: 0, isActive: true },
        { date: '07 October 2026', startTime: '10:00 AM', endTime: '11:30 AM', capacity: 40, bookedCount: 0, isActive: true },
        { date: '10 October 2026', startTime: '10:00 AM', endTime: '11:30 AM', capacity: 50, bookedCount: 0, isActive: true }
      ];
      await ExamSlot.insertMany(defaultSlots);
      console.log('Auto-seeded 12 entrance exam slots.');
    }
  } catch (err) {
    console.warn('Auto-seed warning:', err.message);
  }
};

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_admission';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Automatically initialize default records on connect
    await autoSeed();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
