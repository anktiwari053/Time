const Theme = require('../models/Theme');
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');
const Admin = require('../models/Admin');

// Allowed roles for theme head
const ALLOWED_THEME_HEAD_ROLES = ['Lead', 'Manager', 'Senior Developer'];

// @desc    Get all themes
// @route   GET /api/themes
// @access  Public
exports.getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find()
      .populate('members', 'name role workDetail image')
      .populate('themeHead', 'name role workDetail image')
      .populate('createdBy', 'username')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: themes.length,
      data: themes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single theme
// @route   GET /api/themes/:id
// @access  Public
exports.getTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id)
      .populate('members', 'name role workDetail image')
      .populate('themeHead', 'name role workDetail image')
      .populate('createdBy', 'username');

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    res.status(200).json({
      success: true,
      data: theme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create theme
// @route   POST /api/themes
// @access  Private (Admin)
exports.createTheme = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name || !description || name.trim() === '' || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and description'
      });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create theme'
      });
    }

    const theme = await Theme.create({
      name,
      description,
      members: [],
      themeHead: null,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Theme created successfully',
      data: theme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add members to theme
// @route   PUT /api/themes/:id/members
// @access  Private (Admin)
exports.addMembersToTheme = async (req, res) => {
  try {
    const { memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide memberIds array'
      });
    }

    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    // Check if members exist
    const foundMembers = await TeamMember.find({ _id: { $in: memberIds } });
    if (foundMembers.length !== memberIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some members not found'
      });
    }

    // Add members to theme (avoid duplicates)
    const existingMembers = new Set(theme.members.map(id => id.toString()));
    const newMembers = memberIds.filter(id => !existingMembers.has(id.toString()));

    if (newMembers.length > 0) {
      await Theme.updateOne({ _id: req.params.id }, { $push: { members: { $each: newMembers } } });
    }

    const populatedTheme = await Theme.findById(req.params.id)
      .populate('members', 'name role workDetail image')
      .populate('themeHead', 'name role workDetail image');

    res.status(200).json({
      success: true,
      message: 'Members added to theme successfully',
      data: populatedTheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign/change theme head
// @route   PUT /api/themes/:id/theme-head
// @access  Private (Admin)
exports.assignThemeHead = async (req, res) => {
  try {
    const { memberId } = req.body;

    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    if (memberId) {
      // Check if member exists and is in theme members
      const member = await TeamMember.findById(memberId);
      if (!member) {
        return res.status(400).json({
          success: false,
          message: 'Member not found'
        });
      }

      if (!theme.members.includes(memberId)) {
        return res.status(400).json({
          success: false,
          message: 'Theme head must be one of the theme members'
        });
      }

      await Theme.updateOne({ _id: req.params.id }, { themeHead: memberId });
    } else {
      // Remove theme head
      await Theme.updateOne({ _id: req.params.id }, { themeHead: null });
    }

    const populatedTheme = await Theme.findById(req.params.id)
      .populate('members', 'name role workDetail image')
      .populate('themeHead', 'name role workDetail image');

    res.status(200).json({
      success: true,
      message: 'Theme head updated successfully',
      data: populatedTheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update theme
// @route   PUT /api/themes/:id
// @access  Private (Admin)
exports.updateTheme = async (req, res) => {
  try {
    const { name, description } = req.body;

    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    if (name) theme.name = name;
    if (description) theme.description = description;

    await theme.save();

    const populatedTheme = await Theme.findById(theme._id)
      .populate('members', 'name role workDetail image')
      .populate('themeHead', 'name role workDetail image');

    res.status(200).json({
      success: true,
      message: 'Theme updated successfully',
      data: populatedTheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete theme
// @route   DELETE /api/themes/:id
// @access  Private (Admin)
exports.deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    await Theme.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Theme deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
