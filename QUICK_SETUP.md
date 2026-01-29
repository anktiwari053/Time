# Quick Setup Guide - Image Upload & Complete CRUD

## What Was Fixed

✅ **Backend:** Updated MongoDB schemas to support image fields  
✅ **Backend:** Implemented Multer middleware for file uploads  
✅ **Backend:** Updated all create controllers (Project, Theme, TeamMember) to handle images  
✅ **Backend:** Added static file serving for image access  
✅ **Frontend:** Updated all forms to support file uploads  
✅ **Frontend:** Added image display in UI (cards and tables)  
✅ **Authentication:** JWT role-based access control verified  

---

## Required Installation

### Backend - Install Multer
```bash
cd backend
npm install multer
```

Or if package.json was updated:
```bash
npm install
```

---

## Running the Application

### Terminal 1: Start Backend
```bash
cd backend
npm start
# Server runs at http://localhost:5000
# Uploads folder: backend/uploads/
```

### Terminal 2: Start Admin Panel
```bash
cd admin-panel
npm start
# App opens at http://localhost:3000
```

### Terminal 3: Start User Frontend (Optional)
```bash
cd frontend
npm start
# App opens at http://localhost:3001
```

---

## Testing the Forms

### 1. Admin Login
- Navigate to Admin Panel: http://localhost:3000/login
- Use admin credentials
- You'll see: Dashboard, Projects, Themes, Team Members

### 2. Add Project
```
URL: http://localhost:3000/projects
Click: "Add Project" button
Fill Form:
  - Name: "E-Commerce Platform"
  - Description: "Build modern e-commerce system"
  - Status: "Ongoing"
  - Image: Select a JPG/PNG file (optional)
Click: "Create" button
Expected: Project appears in list with image (if uploaded)
```

### 3. Add Theme
```
URL: http://localhost:3000/themes
Click: "Add Theme" button
Fill Form:
  - Name: "Ocean Blue"
  - Project: Select from dropdown (must have projects)
  - Primary Color: #0066FF
  - Secondary Color: #FFFFFF
  - Image: Select a file (optional)
Click: "Create" button
Expected: Theme appears with color preview and image
```

### 4. Add Team Member
```
URL: http://localhost:3000/team
Click: "Add Member" button
Fill Form:
  - Name: "John Doe"
  - Role: "Frontend Developer"
  - Work Detail: "Building UI components"
  - Theme: Select from dropdown (must have themes)
  - Image: Select a photo file (optional)
Click: "Create" button
Expected: Member appears in table with thumbnail image
```

---

## File Structure Reference

### New/Updated Files

**Backend:**
- `middleware/upload.js` - NEW (Multer configuration)
- `models/Project.js` - UPDATED (added image field)
- `models/Theme.js` - UPDATED (added image, primaryColor, secondaryColor fields)
- `models/TeamMember.js` - UPDATED (added image field)
- `controllers/projectController.js` - UPDATED (image handling in createProject)
- `controllers/themeController.js` - UPDATED (image handling, project selection)
- `controllers/teamController.js` - UPDATED (image handling)
- `routes/projectRoutes.js` - UPDATED (added upload middleware)
- `routes/themeRoutes.js` - UPDATED (added upload middleware)
- `routes/teamRoutes.js` - UPDATED (added upload middleware)
- `server.js` - UPDATED (static file serving for uploads)
- `uploads/` - AUTO-CREATED (stores uploaded images)
- `package.json` - UPDATED (added multer dependency)

**Frontend:**
- `admin-panel/src/pages/Projects.js` - UPDATED (file input + image display)
- `admin-panel/src/pages/Themes.js` - UPDATED (project dropdown + file input)
- `admin-panel/src/pages/TeamMembers.js` - UPDATED (file input + table image display)

---

## API Endpoints Summary

### Projects
```
GET  /api/projects           → List all projects
POST /api/projects           → Create project (Admin, with image)
PUT  /api/projects/:id       → Update project (Admin)
DELETE /api/projects/:id     → Delete project (Admin)
```

### Themes
```
GET  /api/themes             → List all themes
POST /api/themes             → Create theme (Admin, with project, image)
PUT  /api/themes/:id         → Update theme (Admin)
DELETE /api/themes/:id       → Delete theme (Admin)
```

### Team Members
```
GET  /api/team               → List all team members
POST /api/team               → Create member (Admin, with theme, image)
PUT  /api/team/:id           → Update member (Admin)
DELETE /api/team/:id         → Delete member (Admin)
```

---

## Authentication Flow (Verified)

1. **Admin Login** → JWT token with `{ id, role: 'admin' }` in payload
2. **Token Storage** → Stored in localStorage as 'token'
3. **Auto Attachment** → Axios interceptor adds `Authorization: Bearer {token}` header
4. **Backend Verification** → `protect` middleware verifies JWT
5. **Role Check** → `authorize('admin')` middleware checks role
6. **Request Allowed** → Only admins can create/update/delete

---

## Image Access

**Frontend Display:**
```javascript
// For projects and themes
<img src={`http://localhost:5000${item.image}`} />

// For team members in table
<img src={`http://localhost:5000${member.image}`} style={{width: '50px', height: '50px'}} />
```

**Backend Storage:**
```
/uploads/{filename}
Example: /uploads/image-1704067200000-123456789.jpg
```

---

## Troubleshooting

### Issue: Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID {PID} /F
```

### Issue: Multer Not Found
```bash
cd backend
npm install multer
npm start
```

### Issue: Images Not Displaying
1. Check backend console for upload errors
2. Verify file was created: `ls backend/uploads/`
3. Confirm image URL: `http://localhost:5000/uploads/{filename}`

### Issue: 403 Forbidden
1. Check JWT token in browser localStorage
2. Verify token has `role: 'admin'`
3. Check Authorization header in Network tab

### Issue: Form Submission Error
1. Check browser console for error details
2. Verify all required fields are filled
3. Verify file size < 5MB
4. Verify file type is image (JPEG, PNG, GIF, WebP)

---

## Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project_management
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=30d
ADMIN_SECRET_KEY=ANK@Admin#2026!X9
```

**Admin Panel (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Next Steps

1. ✅ Run backend & frontend servers
2. ✅ Test all create forms with images
3. ✅ Verify data is saved in MongoDB
4. ✅ Check images are accessible via HTTP
5. ✅ Test update/delete operations (not yet implemented)
6. ⚠️ Implement update forms for editing existing resources
7. ⚠️ Add confirmation dialogs for delete operations
8. ⚠️ Implement image deletion when resource is deleted
9. ⚠️ Add loading indicators and error notifications
10. ⚠️ Consider uploading images to cloud storage (AWS S3, Cloudinary)

---

## MongoDB Collections

After testing, verify collections contain data:
```javascript
// In MongoDB shell or Compass
db.projects.find()      // See projects with image paths
db.themes.find()        // See themes with image paths
db.teamembers.find()    // See team members with image paths
```

---

## Support

All code has been updated. If you encounter issues:
1. Check console errors (browser DevTools)
2. Check backend terminal for error logs
3. Verify MongoDB is running
4. Verify ports 5000 and 3000 are available
5. Refer to IMPLEMENTATION_SUMMARY.md for detailed changes
