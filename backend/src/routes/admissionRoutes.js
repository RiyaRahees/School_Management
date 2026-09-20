const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  getCompletedAdmissions,
  updateExamScore,
  assignCourse
} = require('../controllers/admissionController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  updateScoreValidator,
  assignCourseValidator
} = require('../validators/admissionValidator');

// All admission routes are restricted to ADMISSION_TEAM
router.use(protect, requireRole('ADMISSION_TEAM'));

// View all student applications (supports ?page=1&limit=10&status=...)
router.get('/', getAllApplications);

// View completed admissions
router.get('/completed', getCompletedAdmissions);

// Update student exam score
router.patch('/:studentId/exam-score', updateScoreValidator, updateExamScore);

// Assign course and complete admission
router.patch('/:studentId/course', assignCourseValidator, assignCourse);

module.exports = router;
