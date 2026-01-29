const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectWithThemes
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProject);
router.get('/:id/themes', getProjectWithThemes);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), upload.single('image'), createProject);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);

module.exports = router;

