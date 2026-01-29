# Authentication Code Reference

## Updated Auth Middleware (backend/middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Protect routes - verify JWT and set req.user
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // ✅ Set user data from token (includes role)
      // This is faster and more reliable than DB lookup
      req.user = {
        id: decoded.id,
        role: decoded.role || 'user'
      };

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Role-based access - use after protect
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  };
};
```

---

## Updated Auth Controller (backend/controllers/authController.js)

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// ✅ Updated to include role in token
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({ name, email, password });
    // ✅ Pass role to token generation
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
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

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // ✅ Pass role to token generation
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
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

exports.getMe = async (req, res) => {
  try {
    // ✅ req.user.id comes from token (no need for DB lookup)
    const user = await User.findById(req.user.id);
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
```

---

## Updated Admin Controller (backend/controllers/adminController.js)

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin-secret-key-change-in-production';

// ✅ Updated to include role in token
const generateToken = (id, role = 'admin') => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Authorization check
    let isAuthorized = false;
    
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

    if (!isAuthorized) {
      if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin secret key'
        });
      }
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    // ✅ Pass role to token generation
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

exports.adminLogin = async (req, res) => {
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

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // ✅ Only allow login if role is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // ✅ Pass role to token generation
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

exports.getMe = async (req, res) => {
  try {
    // ✅ req.user.id comes from token
    const user = await User.findById(req.user.id);
    
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
```

---

## Frontend API Service (frontend/src/services/api.js)

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ✅ This automatically attaches token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// Public endpoints
export const getProjects = (status) => 
  api.get(`/projects${status ? `?status=${status}` : ''}`);

// Protected endpoints (requires login)
export const createProject = (data) => api.post('/projects', data);

// Auth endpoints
export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });
export const login = (email, password) =>
  api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');

export default api;
```

---

## Admin Panel API Service (admin-panel/src/services/api.js)

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Protected Routes Example (backend/routes/projectRoutes.js)

```javascript
const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// ✅ Public routes - no auth needed
router.get('/', getAllProjects);
router.get('/:id', getProject);

// ✅ Protected routes - need auth + admin role
router.post('/', protect, authorize('admin'), createProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);

module.exports = router;
```

---

## Frontend Login Example (React)

```javascript
import { useState } from 'react';
import { login } from '../services/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      
      // ✅ Token is in response.data.token
      const token = response.data.token;
      const user = response.data.data;
      
      // Store token (axios will use it automatically)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </form>
  );
}
```

---

## Testing Authentication with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Register Admin
```bash
curl -X POST http://localhost:5000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "adminKey": "ANK@Admin#2026!X9"
  }'
```

### Login as Admin
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Create Project (as Admin)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "name": "My Project",
    "description": "Project description"
  }'
```

### Create Project (as Regular User - Will Fail)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE" \
  -d '{
    "name": "My Project",
    "description": "Project description"
  }'
# Response: 403 Forbidden - Access denied. Admin role required.
```

---

## Decode JWT Token (Debug)

Go to https://jwt.io and paste your token. You'll see:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "role": "admin",
  "iat": 1704067200,
  "exp": 1711843200
}
```

✅ Token should have `role` field now!
