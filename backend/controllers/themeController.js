const Theme = require('../models/Theme');
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');
const { sendThemeNotification } = require('../utils/emailService');

// @desc    Get all themes
// @route   GET /api/themes
// @access  Public
exports.getAllThemes = async (req, res) => {
  try {
    const { project } = req.query;
    let query = {};
    
    if (project) {
      query.project = project;
    }

    const themes = await Theme.find(query).populate('project', 'name status').sort({ createdAt: -1 });

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
    const theme = await Theme.findById(req.params.id).populate('project', 'name description status');

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
// @access  Private
exports.createTheme = async (req, res) => {
  try {
    const { name, description, primaryColor, secondaryColor, project } = req.body;

    // Validation
    if (!name || !project) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and project'
      });
    }

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Handle image file
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const theme = await Theme.create({
      name,
      description,
      primaryColor: primaryColor || '#000000',
      secondaryColor: secondaryColor || '#FFFFFF',
      project,
      image: imageUrl
    });

    const populatedTheme = await Theme.findById(theme._id).populate('project', 'name');

    // Send notification
    await sendThemeNotification(theme.name, projectExists.name, 'Added');

    res.status(201).json({
      success: true,
      message: 'Theme created successfully',
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
// @access  Private
exports.updateTheme = async (req, res) => {
  try {
    let theme = await Theme.findById(req.params.id).populate('project', 'name');

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    // If project is being updated, verify it exists
    if (req.body.project) {
      const projectExists = await Project.findById(req.body.project);
      if (!projectExists) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    theme = await Theme.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('project', 'name');

    // Send notification
    const projectName = theme.project.name;
    await sendThemeNotification(theme.name, projectName, 'Updated');

    res.status(200).json({
      success: true,
      message: 'Theme updated successfully',
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

// @desc    Delete theme
// @route   DELETE /api/themes/:id
// @access  Private
exports.deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    // Delete all team members associated with this theme
    await TeamMember.deleteMany({ theme: req.params.id });

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

// @desc    Get theme with team members
// @route   GET /api/themes/:id/team
// @access  Public
exports.getThemeWithTeam = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id).populate('project', 'name description status');

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    const teamMembers = await TeamMember.find({ theme: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        theme,
        teamMembers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
