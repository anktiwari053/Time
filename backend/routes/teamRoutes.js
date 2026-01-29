const express = require('express');
const router = express.Router();
const {
  getAllTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllTeamMembers);
router.get('/:id', getTeamMember);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), upload.single('image'), createTeamMember);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateTeamMember);
router.delete('/:id', protect, authorize('admin'), deleteTeamMember);

module.exports = router;

