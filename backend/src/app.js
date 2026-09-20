const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const examSlotRoutes = require('./routes/examSlotRoutes');
const admissionRoutes = require('./routes/admissionRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'School Admission Management API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/exam-slots', examSlotRoutes);
app.use('/api/admissions', admissionRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
