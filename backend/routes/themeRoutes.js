const express = require('express');
const router = express.Router();
const {
  getAllThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  getThemeWithTeam
} = require('../controllers/themeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllThemes);
router.get('/:id', getTheme);
router.get('/:id/team', getThemeWithTeam);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), upload.single('image'), createTheme);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateTheme);
router.delete('/:id', protect, authorize('admin'), deleteTheme);

module.exports = router;

