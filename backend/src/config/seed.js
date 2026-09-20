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

    // 1. Seed Admission Team admin accounts
    const adminEmail = 'admin@school.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admission Office Head',
        email: adminEmail,
        password: 'admin123',
        role: 'ADMISSION_TEAM'
      });
      console.log(`Created ADMISSION_TEAM account: ${adminEmail} (password: admin123)`);
    } else {
      console.log(`ADMISSION_TEAM account verified: ${adminEmail}`);
    }

    const admissionAltEmail = 'admission@school.com';
    let altAdminUser = await User.findOne({ email: admissionAltEmail });
    if (!altAdminUser) {
      await User.create({
        name: 'Admission Officer',
        email: admissionAltEmail,
        password: 'admin123',
        role: 'ADMISSION_TEAM'
      });
      console.log(`Created secondary ADMISSION_TEAM account: ${admissionAltEmail} (password: admin123)`);
    }

    // Seed Demo Parent accounts
    const parentAccounts = [
      { name: 'Riya Rahees', email: 'riyarahees136@gmail.com', password: '123123' },
      { name: 'Demo Parent', email: 'parent@example.com', password: 'password123' }
    ];

    for (const acc of parentAccounts) {
      let pUser = await User.findOne({ email: acc.email });
      if (!pUser) {
        await User.create({
          name: acc.name,
          email: acc.email,
          password: acc.password,
          role: 'PARENT'
        });
        console.log(`Created PARENT account: ${acc.email} (password: ${acc.password})`);
      } else {
        console.log(`PARENT account verified: ${acc.email}`);
      }
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
