const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin-secret-key-change-in-production';

const generateToken = (id, role = 'admin') => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @desc    Admin Signup (requires secret key OR existing admin token)
// @route   POST /api/admin/signup
// @access  Public (but protected by secret key or admin token)
exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    // Validation
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

    // Method 1: Check if request has valid admin token (from existing admin)
    let isAuthorized = false;
    
    // Try to get admin from token if Authorization header exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const adminUser = await User.findById(decoded.id);
        
        if (adminUser && adminUser.role === 'admin') {
          isAuthorized = true;
        }
      } catch (err) {
        // Token invalid or expired, will check secret key
      }
    }

    // Method 2: Check secret admin key from environment variable
    if (!isAuthorized) {
      if (!adminKey) {
        return res.status(403).json({
          success: false,
          message: 'Admin signup requires either a valid admin token or admin secret key'
        });
      }
      
      console.log('DEBUG: Received adminKey:', adminKey);
      console.log('DEBUG: Expected ADMIN_SECRET_KEY:', ADMIN_SECRET_KEY);
      console.log('DEBUG: Match:', adminKey === ADMIN_SECRET_KEY);
      
      if (adminKey !== ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin secret key',
          debug: {
            received: adminKey,
            expected: ADMIN_SECRET_KEY,
            receivedLength: adminKey?.length,
            expectedLength: ADMIN_SECRET_KEY?.length
          }
        });
      }
      isAuthorized = true;
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin' // Fixed role as admin
    });

    const token = generateToken(admin._id, admin.role);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
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

// @desc    Admin Login (only for users with role=admin)
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // CRITICAL: Only allow login if role is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Generate token
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
    
    // Double check role
    if (user.role !== 'admin') {
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
