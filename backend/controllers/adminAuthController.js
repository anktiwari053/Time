const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin-secret-key-change-in-production';

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @desc    Admin Signup (requires secret key or existing admin)
// @route   POST /api/admin/signup
// @access  Protected (secret key or admin token)
exports.signup = async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Verify admin signup authorization
    let isAuthorized = false;

    // Method 1: Check if request has valid admin token (existing admin creating new admin)
    if (req.user && req.user.role === 'admin') {
      isAuthorized = true;
    }
    // Method 2: Check secret admin key from environment variable
    else if (adminKey && adminKey === ADMIN_SECRET_KEY) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin signup requires valid admin token or secret key.'
      });
    }

    // Create admin user with fixed role
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin' // Fixed role for admin signup
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Admin registration successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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

// @desc    Admin Login (only for admin role users)
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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

// @desc    Get current admin
// @route   GET /api/admin/me
// @access  Private (Admin only)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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
