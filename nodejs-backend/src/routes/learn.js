const express = require('express');
const router = express.Router();
const learnController = require('../modules/learn/learnController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/learn/lessons
 * @desc    Get all lessons/practices
 * @query   type - lesson or practice (optional)
 * @access  Public
 */
router.get('/lessons', (req, res, next) =>
  learnController.getAllLessons(req, res, next)
);

/**
 * @route   GET /api/learn/lessons/:lessonId
 * @desc    Get specific lesson
 * @access  Public
 */
router.get('/lessons/:lessonId', (req, res, next) =>
  learnController.getLessonById(req, res, next)
);

/**
 * @route   POST /api/learn/lessons
 * @desc    Create lesson/practice
 * @access  Private Admin
 */
router.post('/lessons', authMiddleware, adminMiddleware, (req, res, next) =>
  learnController.createLesson(req, res, next)
);

/**
 * @route   POST /api/learn/complete
 * @desc    Complete a lesson
 * @access  Private
 */
router.post('/complete', authMiddleware, (req, res, next) =>
  learnController.completeLesson(req, res, next)
);

/**
 * @route   GET /api/learn/history
 * @desc    Get user learning history
 * @access  Private
 */
router.get('/history', authMiddleware, (req, res, next) =>
  learnController.getLearningHistory(req, res, next)
);

module.exports = router;
