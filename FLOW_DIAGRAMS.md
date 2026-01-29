# 🔐 Authentication Flow Diagrams

## 1. User Registration & Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                         │
└─────────────────────────────────────────────────────────────┘

FRONTEND                          BACKEND
────────────────────────────────────────────
   │ POST /auth/register
   │ {name, email, password}
   ├──────────────────────────────────────────→ authController.register()
   │                                            │
   │                                            ├─ Check if user exists
   │                                            ├─ Hash password
   │                                            ├─ Create User with role='user'
   │                                            │
   │                                            ├─ generateToken(id, 'user')
   │                                            │  jwt.sign({id, role}, SECRET)
   │                                            │
   │                                            └─ Return {token, data}
   │
   ←──────────────────────────────────────────
   │ {
   │   token: "eyJ...",
   │   data: {id, name, email, role: "user"}
   │ }
   │
   ├─ localStorage.setItem('token', token)
   └─ Redirect to /dashboard


┌─────────────────────────────────────────────────────────────┐
│                      USER LOGIN                              │
└─────────────────────────────────────────────────────────────┘

FRONTEND                          BACKEND
────────────────────────────────────────────
   │ POST /auth/login
   │ {email, password}
   ├──────────────────────────────────────────→ authController.login()
   │                                            │
   │                                            ├─ Find user by email
   │                                            ├─ Compare password
   │                                            │
   │                                            ├─ generateToken(id, role)
   │                                            │  jwt.sign({id, role}, SECRET)
   │                                            │
   │                                            └─ Return {token, data}
   │
   ←──────────────────────────────────────────
   │ {
   │   token: "eyJ...",
   │   data: {id, name, email, role: "user"}
   │ }
   │
   ├─ localStorage.setItem('token', token)
   └─ Redirect to /dashboard
```

---

## 2. Protected API Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│          PROTECTED API REQUEST (Admin Only)                  │
└─────────────────────────────────────────────────────────────┘

FRONTEND                          BACKEND
────────────────────────────────────────────
   │ GET /api/projects
   │ (from localStorage)
   │ token = "eyJ..."
   │
   ├─ axios interceptor
   │  config.headers.Authorization = "Bearer eyJ..."
   │
   ├──────────────────────────────────────────→ middleware/auth.js
   │                                            │
   │                                            ├─ Extract token from header
   │                                            │  "Bearer eyJ..." → "eyJ..."
   │                                            │
   │                                            ├─ jwt.verify(token, SECRET)
   │                                            │  Decode: {id, role, iat, exp}
   │                                            │
   │                                            ├─ req.user = {id, role}
   │                                            │
   │                                            ├─ call next() → authorize()
   │                                            │
   │ (authorize middleware)                    ├─ Check: roles.includes(req.user.role)
   │                                            │
   │                                            ├─ If admin:
   │                                            │  └─ call next() → controller
   │                                            │
   │                                            ├─ If user (not admin):
   │                                            │  └─ return 403 Forbidden
   │                                            │
   │                                            ├─ getAllProjects()
   │                                            │
   │                                            └─ return {projects}
   │
   ←──────────────────────────────────────────
   │ 200 OK
   │ [project1, project2, ...]
   │
   └─ Display projects
```

---

## 3. JWT Token Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    JWT TOKEN STRUCTURE                        │
└──────────────────────────────────────────────────────────────┘

Original Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzExODQzMjAwfQ.
5VqF9k3tJ8sL2mX9pQ7rT6yU1wO4aB5cD6eF7gH8iJ

┌─────────────────────────────────┐
│        HEADER (Base64)          │
├─────────────────────────────────┤
│ {                               │
│   "alg": "HS256",              │
│   "typ": "JWT"                 │
│ }                               │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        PAYLOAD (Base64)          │  ✅ NOW INCLUDES ROLE!
├─────────────────────────────────┤
│ {                               │
│   "id": "507f1f77bcf86cd799..", │  ← User ID
│   "role": "admin",              │  ← Role (NEW!)
│   "iat": 1704067200,            │  ← Issued at
│   "exp": 1711843200             │  ← Expires at
│ }                               │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      SIGNATURE (HMACSHA256)      │
├─────────────────────────────────┤
│ HMACSHA256(                     │
│   header.payload,               │
│   JWT_SECRET                    │
│ )                               │
└─────────────────────────────────┘
```

---

## 4. Role-Based Access Control

```
┌──────────────────────────────────────────────────────────────┐
│              ROLE-BASED ACCESS FLOW                           │
└──────────────────────────────────────────────────────────────┘

REQUEST ARRIVES
    │
    ├─ Is token present?
    │  ├─ NO → 401 Unauthorized
    │  └─ YES → Next
    │
    ├─ Is token valid?
    │  ├─ NO → 401 Unauthorized  
    │  └─ YES → Extract role
    │
    ├─ What role was requested?
    │  │
    │  ├─ router.get('/', getAllProjects)  ← No auth needed
    │  │  ├─ NO protect middleware
    │  │  └─ Everyone can access
    │  │
    │  ├─ router.post('/', protect, authorize('admin'), createProject)
    │  │  ├─ protect middleware: Check token
    │  │  ├─ authorize('admin'): Check role === 'admin'
    │  │  │
    │  │  ├─ IF role === 'admin'
    │  │  │  └─ ✅ 200 OK → Create project
    │  │  │
    │  │  └─ IF role === 'user' (not admin)
    │  │     └─ ❌ 403 Forbidden → Access denied


┌──────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE EXECUTION                         │
└──────────────────────────────────────────────────────────────┘

Route Definition:
  router.post('/', protect, authorize('admin'), createProject);

Request Flow:
  1. POST /api/projects
  
  2. protect middleware
     ├─ Extract Authorization header
     ├─ Split "Bearer token" → token
     ├─ jwt.verify(token)
     ├─ req.user = {id, role}
     └─ next() → authorize
  
  3. authorize('admin') middleware
     ├─ Check roles.includes('admin')
     ├─ If true: next() → createProject
     └─ If false: res.status(403)
  
  4. createProject controller
     └─ req.user.id and req.user.role available
```

---

## 5. Common Error Scenarios

```
┌──────────────────────────────────────────────────────────────┐
│               ERROR: 401 UNAUTHORIZED                         │
└──────────────────────────────────────────────────────────────┘

Cause 1: No token in localStorage
  localStorage.getItem('token') → null
  Request: GET /api/projects
  No Authorization header
  ❌ Backend: 401 Unauthorized

Cause 2: Invalid token
  Authorization: Bearer invalid.token.here
  jwt.verify() throws error
  ❌ Backend: 401 Unauthorized

Cause 3: Expired token
  Token exp: 1704067200 (expired)
  jwt.verify() throws TokenExpiredError
  ❌ Backend: 401 Unauthorized


┌──────────────────────────────────────────────────────────────┐
│               ERROR: 403 FORBIDDEN                            │
└──────────────────────────────────────────────────────────────┘

Cause: User lacks required role
  Request: POST /api/projects
  Authorization: Bearer eyJ...
  Token payload: {role: "user"}
  
  Route requires: authorize('admin')
  Middleware check: 'admin' in ['user'] ? NO
  ❌ Backend: 403 Forbidden


┌──────────────────────────────────────────────────────────────┐
│               SOLUTION FLOW                                   │
└──────────────────────────────────────────────────────────────┘

❌ Problem                    ✅ Solution
────────────────────────────  ──────────────────────────────
No token                      → Login first
Invalid token                 → Logout and login again
Expired token                 → Refresh token (if implemented)
Wrong role (user vs admin)    → Login as admin
Wrong adminKey                → Check .env for correct key
Token doesn't have role       → FIXED! (This was the bug)
```

---

## 6. Admin Setup Flow

```
┌──────────────────────────────────────────────────────────────┐
│              FIRST ADMIN CREATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

STEP 1: Set Admin Secret Key in .env
  File: backend/.env
  ┌─────────────────────────────────┐
  │ ADMIN_SECRET_KEY=ANK@Admin#2026!X9
  └─────────────────────────────────┘

STEP 2: Admin Signup with Secret Key
  POST /api/admin/signup
  {
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "adminKey": "ANK@Admin#2026!X9"  ← Must match .env
  }

STEP 3: Backend Validation
  adminController.adminSignup()
  │
  ├─ Check adminKey === ADMIN_SECRET_KEY
  │  ├─ Match → Authorized
  │  └─ No match → 403 Forbidden
  │
  ├─ Create User with role='admin'
  │
  ├─ generateToken(id, 'admin')
  │  jwt.sign({id, role: 'admin'}, SECRET)
  │
  └─ Return {token, data: {role: 'admin'}}

STEP 4: Frontend Stores Token
  localStorage.setItem('token', token)

STEP 5: Admin Can Now Create More Admins
  POST /api/admin/signup
  Authorization: Bearer <admin-token>
  {
    "name": "New Admin",
    "email": "admin2@example.com",
    "password": "password123"
    // No adminKey needed - existing admin token is enough
  }

STEP 6: Regular Users Can't Signup as Admin
  POST /api/admin/signup
  Authorization: Bearer <user-token>
  {
    "name": "Hacker",
    "email": "hacker@example.com",
    "password": "password123"
  }
  
  Backend checks:
  user.role !== 'admin' → 403 Forbidden
```

---

## 7. Before vs After Comparison

```
┌──────────────────────────────────────────────────────────────┐
│              BEFORE FIX (403 Errors)                          │
└──────────────────────────────────────────────────────────────┘

JWT Generation:
  generateToken(id) → jwt.sign({id}, SECRET)
  
JWT Payload:
  {id: "...", iat: ..., exp: ...}
  ❌ Missing role!

Middleware:
  const decoded = jwt.verify(token)
  req.user = await User.findById(decoded.id)
  
Authorization Check:
  if (!roles.includes(req.user.role))
  req.user.role = undefined ❌
  → Always returns 403!

Result:
  ❌ All protected routes return 403
  ❌ No way to verify user has admin role


┌──────────────────────────────────────────────────────────────┐
│              AFTER FIX (Works Correctly)                      │
└──────────────────────────────────────────────────────────────┘

JWT Generation:
  generateToken(id, role) → jwt.sign({id, role}, SECRET)
  
JWT Payload:
  {id: "...", role: "admin", iat: ..., exp: ...}
  ✅ Role included!

Middleware:
  const decoded = jwt.verify(token)
  req.user = {id: decoded.id, role: decoded.role}
  
Authorization Check:
  if (!roles.includes(req.user.role))
  req.user.role = "admin" ✅
  → Works correctly!

Result:
  ✅ Admin routes accessible to admins
  ✅ Admin routes blocked for regular users
  ✅ 403 errors appear only when appropriate
```

---

## 8. Testing Token with jwt.io

```
┌──────────────────────────────────────────────────────────────┐
│                    DEBUG YOUR TOKEN                           │
└──────────────────────────────────────────────────────────────┘

1. Get token from localStorage
   const token = localStorage.getItem('token');
   console.log(token);

2. Go to https://jwt.io

3. Paste token in "Encoded" field

4. See the decoded payload in "Decoded" section

5. Look for "role" field:
   
   ❌ BEFORE (broken)
   {
     "id": "...",
     "iat": 1704067200,
     "exp": 1711843200
   }
   ❌ Missing "role" field!
   
   ✅ AFTER (fixed)
   {
     "id": "...",
     "role": "admin",      ← This field now exists!
     "iat": 1704067200,
     "exp": 1711843200
   }
   ✅ Role field present!
```

---

## Summary of Fixes

```
┌──────────────────────────────────────────────────────────────┐
│                   WHAT WAS CHANGED                            │
└──────────────────────────────────────────────────────────────┘

File: authController.js
  generateToken(id) → generateToken(id, role)
  generateToken(user._id) → generateToken(user._id, user.role)

File: adminAuthController.js
  generateToken(id) → generateToken(id, role)
  generateToken(user._id) → generateToken(user._id, user.role)

File: adminController.js
  generateToken(id) → generateToken(id, role)
  generateToken(admin._id) → generateToken(admin._id, admin.role)

File: middleware/auth.js
  req.user = await User.findById(...)
    → req.user = {id: decoded.id, role: decoded.role}

Result:
  ✅ JWT tokens now include role
  ✅ Middleware can check req.user.role
  ✅ Authorization works correctly
  ✅ 403 errors appear when appropriate
  ✅ Admin routes protected properly
```
