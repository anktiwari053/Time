const TeamMember = require('../models/TeamMember');
const Theme = require('../models/Theme');

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
exports.getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
exports.getTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create team member
// @route   POST /api/team
// @access  Private
exports.createTeamMember = async (req, res) => {
  try {
    const { name, role, workDetail } = req.body;

    // Validation
    if (!name || !role || !workDetail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, role, and workDetail'
      });
    }

    // Handle image file
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const teamMember = await TeamMember.create({
      name,
      role,
      workDetail,
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: teamMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private
exports.updateTeamMember = async (req, res) => {
  try {
    let teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const { name, role, workDetail } = req.body;

    // Validation
    if (!name || !role || !workDetail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, role, and workDetail'
      });
    }

    // Handle image file
    let imageUrl = teamMember.image; // Keep existing if no new image
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { name, role, workDetail, image: imageUrl },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: teamMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private
exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    await TeamMember.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
