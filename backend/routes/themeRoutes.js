const express = require('express');
const router = express.Router();
const {
  getAllThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  addMembersToTheme,
  assignThemeHead
} = require('../controllers/themeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllThemes);
router.get('/:id', getTheme);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createTheme);
router.put('/:id', protect, authorize('admin'), updateTheme);
router.put('/:id/members', protect, authorize('admin'), addMembersToTheme);
router.put('/:id/theme-head', protect, authorize('admin'), assignThemeHead);
router.delete('/:id', protect, authorize('admin'), deleteTheme);

module.exports = router;

