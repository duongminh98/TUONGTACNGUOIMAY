const express = require('express');
const router = express.Router();
const authController = require('../modules/auth/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route   GET /api/auth/google
 * @desc    Start Google OAuth login
 * @access  Public
 */
router.get('/google', (req, res, next) => authController.googleStart(req, res, next));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', (req, res, next) => authController.googleCallback(req, res, next));

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authMiddleware, (req, res, next) =>
  authController.getProfile(req, res, next)
);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private Admin
 */
router.get('/users', authMiddleware, adminMiddleware, (req, res, next) =>
  authController.getAllUsers(req, res, next)
);

/**
 * @route   DELETE /api/auth/users/:userId
 * @desc    Delete user by id (admin only)
 * @access  Private Admin
 */
router.delete('/users/:userId', authMiddleware, adminMiddleware, (req, res, next) =>
  authController.deleteUser(req, res, next)
);

module.exports = router;
