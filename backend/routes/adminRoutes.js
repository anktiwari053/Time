const express = require('express');
const router = express.Router();
const {
  adminSignup,
  adminLogin,
  getMe
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Admin signup (public but requires secret key or admin token)
router.post('/signup', adminSignup);

// Admin login (public, but only allows role=admin)
router.post('/login', adminLogin);

// Get current admin (protected, admin only)
router.get('/me', protect, authorize('admin'), getMe);

module.exports = router;
