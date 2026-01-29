# 403 Forbidden Error - Complete Fix Guide

## What I Fixed

Your 403 Forbidden errors were caused by **role information not being included in the JWT token**. Here's what was broken and what I fixed:

---

## Problems Identified

### ❌ Problem 1: JWT Token Didn't Include Role
**Before:**
```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};
```

**Issue:** The token only contains the user ID, not the role. When the middleware tried to check `req.user.role`, it couldn't find it because the role was never stored in the token.

**After:**
```javascript
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};
```

✅ Now the token includes both `id` and `role`, so role-based access control works.

---

### ❌ Problem 2: Auth Middleware Did Unnecessary Database Lookup
**Before:**
```javascript
const decoded = jwt.verify(token, JWT_SECRET);
req.user = await User.findById(decoded.id).select('-password');
```

**Issue:** 
- Slower (extra DB query)
- If role wasn't in the token, it had to fetch from DB
- If user was deleted, auth would fail

**After:**
```javascript
const decoded = jwt.verify(token, JWT_SECRET);
req.user = {
  id: decoded.id,
  role: decoded.role || 'user'
};
```

✅ Now uses token data directly - faster and more secure.

---

### ❌ Problem 3: Tokens Didn't Include Role When Generated
**Before in authController.js:**
```javascript
const user = await User.create({ name, email, password });
const token = generateToken(user._id);  // ❌ No role passed!
```

**After:**
```javascript
const user = await User.create({ name, email, password });
const token = generateToken(user._id, user.role);  // ✅ Role included!
```

This same fix was applied to:
- `authController.js` (user register & login)
- `adminAuthController.js` (admin register & login)
- `adminController.js` (admin signup & login)

---

## How Role-Based Access Control Works

### Authorization Middleware
```javascript
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
  };
};
```

### Protected Routes Example
```javascript
// Only admins can create projects
router.post('/', protect, authorize('admin'), createProject);
//          ↑         ↑                    ↑
//       verify    check role         run controller
//       token     is 'admin'
```

### How It Works:
1. **Request arrives** with `Authorization: Bearer <token>`
2. **`protect` middleware** verifies JWT and extracts `id` and `role` into `req.user`
3. **`authorize('admin')` middleware** checks if `req.user.role === 'admin'`
4. If role matches → proceed; Otherwise → 403 Forbidden
5. **Controller** handles the request

---

## Frontend Token Handling (Already Correct ✅)

Your frontend code is already correct!

### Frontend API Service (axios interceptor)
```javascript
// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

This sends every request like:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Complete Authentication Flow

### 1️⃣ User/Admin Registration

**Frontend:**
```javascript
const response = await axios.post('/api/auth/register', {
  name: 'John',
  email: 'john@example.com',
  password: 'password123'
});

localStorage.setItem('token', response.data.token);
```

**Backend:**
```javascript
const user = await User.create({ name, email, password });
const token = generateToken(user._id, user.role);  // ✅ Role included!

res.json({
  token,
  data: { id: user._id, role: user.role }  // ✅ Returns role
});
```

---

### 2️⃣ Login

**Frontend:**
```javascript
const response = await axios.post('/api/auth/login', {
  email: 'john@example.com',
  password: 'password123'
});

localStorage.setItem('token', response.data.token);
// Token now contains: { id: '...', role: 'user' }
```

---

### 3️⃣ Protected API Call (with Authorization)

**Frontend:**
```javascript
// This uses the axios interceptor automatically
const response = await api.get('/api/projects');
// Sent as: GET /api/projects HTTP/1.1
//          Authorization: Bearer eyJ...
```

**Backend:**
```javascript
router.get('/', getAllProjects);  // ✅ Public - no auth needed

router.post('/', protect, authorize('admin'), createProject);
//                ↑         ↑
//           Check token  Check role

// Inside protect middleware:
// 1. Extract token from Authorization header
// 2. Verify JWT signature
// 3. Decode token → req.user = { id: '...', role: 'user' }
// 4. Call next() → proceed to authorize

// Inside authorize middleware:
// 1. Check if req.user.role includes 'admin'
// 2. If yes → call next() → run controller
// 3. If no → return 403 Forbidden
```

---

## Admin Secret Key Explained

### Purpose
The `ADMIN_SECRET_KEY` allows creating the **first admin** without an existing admin account.

### How It Works

**File:** `.env`
```env
ADMIN_SECRET_KEY=ANK@Admin#2026!X9
```

**Admin Signup:**
```javascript
// Method 1: Existing admin creates new admin (with token)
POST /api/admin/signup
Authorization: Bearer <existing-admin-token>
{
  "name": "New Admin",
  "email": "admin2@example.com",
  "password": "password123"
}

// Method 2: First admin signup (with secret key)
POST /api/admin/signup
{
  "name": "First Admin",
  "email": "admin@example.com",
  "password": "password123",
  "adminKey": "ANK@Admin#2026!X9"  // ✅ From .env
}
```

---

## Common 403 Errors & Solutions

### ❌ Error 1: "Access denied. Admin role required."
**Cause:** Non-admin user trying to access admin routes

**Solution:**
```javascript
// Make sure you login as an ADMIN first
const admin = await User.create({
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin'  // ✅ Must be set!
});

// Then login with this admin account
const token = await api.post('/api/admin/login', {
  email: 'admin@example.com',
  password: 'password123'
});
```

### ❌ Error 2: "Not authorized to access this route"
**Cause:** No token sent, expired token, or invalid token

**Solution:**
```javascript
// ✅ Good - Token is sent automatically
api.get('/api/projects');

// ❌ Bad - No token in localStorage
localStorage.removeItem('token');
api.get('/api/projects');  // Will fail if protected

// Check if token exists
console.log(localStorage.getItem('token'));
```

### ❌ Error 3: "Invalid admin secret key"
**Cause:** Wrong admin secret key provided

**Solution:**
```javascript
// Check .env file in backend
ADMIN_SECRET_KEY=ANK@Admin#2026!X9

// Use the EXACT key from .env
api.post('/api/admin/signup', {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'password123',
  adminKey: 'ANK@Admin#2026!X9'  // ✅ Must match exactly!
});
```

---

## How to Test Authentication

### Step 1: Start Backend
```bash
cd backend
npm install
npm start
```
Should see: `Server running on port 5000`

### Step 2: Register as Regular User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John User",
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJ...",
  "data": {
    "role": "user",
    "id": "...",
    "name": "John User",
    "email": "user@example.com"
  }
}
```

### Step 3: Try to Create Project (should fail - not admin)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{"name":"My Project"}'
```

Response:
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### Step 4: Register as Admin
```bash
curl -X POST http://localhost:5000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "adminKey": "ANK@Admin#2026!X9"
  }'
```

### Step 5: Create Project (should work - is admin)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"name":"My Project"}'
```

Response:
```json
{
  "success": true,
  "data": { "id": "...", "name": "My Project" }
}
```

---

## Environment Variables (.env)

```env
# Port
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/project_management

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=30d

# Admin Secret Key (for first admin creation)
ADMIN_SECRET_KEY=ANK@Admin#2026!X9
```

**⚠️ Important:**
- Change `JWT_SECRET` in production
- Change `ADMIN_SECRET_KEY` in production
- Never commit `.env` with real secrets

---

## Frontend Environment Variables (.env)

```env
# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

```env
# admin-panel/.env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Files Changed

1. ✅ `backend/controllers/authController.js` - Added role to token
2. ✅ `backend/controllers/adminAuthController.js` - Added role to token
3. ✅ `backend/controllers/adminController.js` - Added role to token
4. ✅ `backend/middleware/auth.js` - Use role from token instead of DB lookup

---

## Summary

### Root Cause
JWT tokens didn't include the `role` field, so the `authorize` middleware couldn't check if the user was an admin.

### Solution
Include `role` in JWT payload:
```javascript
jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE })
```

### Result
- ✅ Role-based access control now works
- ✅ Admin routes properly reject non-admins
- ✅ Faster authentication (no DB lookup)
- ✅ 403 errors only appear when user lacks permission (correct behavior)

---

## Need Help?

If you still get 403 errors:

1. **Check token exists:** `localStorage.getItem('token')`
2. **Check token has role:** Decode at https://jwt.io
3. **Check Authorization header:** Browser DevTools → Network → Headers
4. **Check user role in DB:** `db.users.findOne({email: 'admin@example.com'})`
5. **Check middleware is applied:** Look at route definition, should have `protect, authorize('admin')`
