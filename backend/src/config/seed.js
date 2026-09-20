const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const ExamSlot = require('../models/ExamSlot');

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_admission';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Seed Admission Team admin account if not exists
    const adminExists = await User.findOne({ role: 'ADMISSION_TEAM' });
    if (!adminExists) {
      await User.create({
        name: 'Admission Office Head',
        email: 'admin@school.com',
        password: 'admin123',
        role: 'ADMISSION_TEAM'
      });
      console.log('Default ADMISSION_TEAM user created: admin@school.com / admin123');
    } else {
      console.log('Admission Team user already exists: ' + adminExists.email);
    }

    // 2. Seed / Update upcoming Exam Slots
    await ExamSlot.deleteMany({});
    const upcomingSlots = [
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
    await ExamSlot.insertMany(upcomingSlots);
    console.log('Seeded 12 upcoming exam slots successfully.');

    console.log('Database seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
