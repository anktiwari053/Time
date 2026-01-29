# API Testing Guide - cURL Commands

## Prerequisites
- Backend running at `http://localhost:5000`
- Admin JWT token from login endpoint
- Replace `{TOKEN}` with actual JWT token

---

## 1. Authentication

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "admin": {
#     "_id": "...",
#     "email": "admin@example.com",
#     "role": "admin"
#   }
# }
```

---

## 2. Projects API

### Get All Projects
```bash
curl -X GET http://localhost:5000/api/projects
```

### Create Project with Image
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer {TOKEN}" \
  -F "name=E-Commerce Platform" \
  -F "description=Build modern e-commerce system" \
  -F "status=ongoing" \
  -F "image=@/path/to/image.jpg"

# Response:
# {
#   "success": true,
#   "message": "Project created successfully",
#   "data": {
#     "_id": "...",
#     "name": "E-Commerce Platform",
#     "description": "Build modern e-commerce system",
#     "status": "ongoing",
#     "image": "/uploads/image-timestamp-random.jpg",
#     "createdAt": "2024-01-29T...",
#     "updatedAt": "2024-01-29T..."
#   }
# }
```

### Get Single Project
```bash
curl -X GET http://localhost:5000/api/projects/{PROJECT_ID}
```

### Update Project
```bash
curl -X PUT http://localhost:5000/api/projects/{PROJECT_ID} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "status": "completed"
  }'
```

### Delete Project
```bash
curl -X DELETE http://localhost:5000/api/projects/{PROJECT_ID} \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 3. Themes API

### Get All Themes
```bash
curl -X GET http://localhost:5000/api/themes
```

### Create Theme with Image
```bash
curl -X POST http://localhost:5000/api/themes \
  -H "Authorization: Bearer {TOKEN}" \
  -F "name=Ocean Blue" \
  -F "primaryColor=#0066FF" \
  -F "secondaryColor=#FFFFFF" \
  -F "project={PROJECT_ID}" \
  -F "image=@/path/to/theme.jpg"

# Response:
# {
#   "success": true,
#   "message": "Theme created successfully",
#   "data": {
#     "_id": "...",
#     "name": "Ocean Blue",
#     "primaryColor": "#0066FF",
#     "secondaryColor": "#FFFFFF",
#     "project": {
#       "_id": "{PROJECT_ID}",
#       "name": "Project Name"
#     },
#     "image": "/uploads/image-timestamp-random.jpg",
#     "createdAt": "2024-01-29T...",
#     "updatedAt": "2024-01-29T..."
#   }
# }
```

### Get All Themes for a Project
```bash
curl -X GET http://localhost:5000/api/themes?project={PROJECT_ID}
```

### Get Single Theme
```bash
curl -X GET http://localhost:5000/api/themes/{THEME_ID}
```

### Delete Theme
```bash
curl -X DELETE http://localhost:5000/api/themes/{THEME_ID} \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 4. Team Members API

### Get All Team Members
```bash
curl -X GET http://localhost:5000/api/team
```

### Create Team Member with Image
```bash
curl -X POST http://localhost:5000/api/team \
  -H "Authorization: Bearer {TOKEN}" \
  -F "name=John Doe" \
  -F "role=Frontend Developer" \
  -F "workDetail=Building UI components with React" \
  -F "theme={THEME_ID}" \
  -F "image=@/path/to/profile.jpg"

# Response:
# {
#   "success": true,
#   "message": "Team member created successfully",
#   "data": {
#     "_id": "...",
#     "name": "John Doe",
#     "role": "Frontend Developer",
#     "workDetail": "Building UI components with React",
#     "theme": {
#       "_id": "{THEME_ID}",
#       "name": "Ocean Blue",
#       "project": {
#         "_id": "{PROJECT_ID}",
#         "name": "E-Commerce Platform"
#       }
#     },
#     "image": "/uploads/image-timestamp-random.jpg",
#     "createdAt": "2024-01-29T...",
#     "updatedAt": "2024-01-29T..."
#   }
# }
```

### Get Team Members for a Theme
```bash
curl -X GET http://localhost:5000/api/team?theme={THEME_ID}
```

### Get Single Team Member
```bash
curl -X GET http://localhost:5000/api/team/{MEMBER_ID}
```

### Delete Team Member
```bash
curl -X DELETE http://localhost:5000/api/team/{MEMBER_ID} \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 5. Error Cases

### Missing Authentication
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Response: 401
# {
#   "success": false,
#   "message": "Not authorized to access this route"
# }
```

### Non-Admin User
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer {USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Response: 403
# {
#   "success": false,
#   "message": "Access denied. Admin role required."
# }
```

### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Response: 400
# {
#   "success": false,
#   "message": "Please provide name and description"
# }
```

### File Too Large
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer {TOKEN}" \
  -F "name=Test" \
  -F "description=Test" \
  -F "image=@/path/to/large-file.jpg"  # >5MB

# Response: 413
# Payload Too Large
```

### Invalid File Type
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer {TOKEN}" \
  -F "name=Test" \
  -F "description=Test" \
  -F "image=@/path/to/file.pdf"

# Response: 400
# {
#   "success": false,
#   "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
# }
```

---

## 6. Image Access

### View Uploaded Image
```bash
# In browser or curl
http://localhost:5000/uploads/image-1704067200000-123456789.jpg

# Via curl
curl -X GET http://localhost:5000/uploads/image-1704067200000-123456789.jpg \
  -o downloaded-image.jpg
```

---

## 7. Testing Workflow

### Step 1: Login as Admin
```bash
# Save response and extract token
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

echo $TOKEN  # Verify token is set
```

### Step 2: Create a Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=New Project" \
  -F "description=Test project" \
  -F "status=ongoing"
```

### Step 3: Get Project ID and Create Theme
```bash
# First, get project ID from previous response
PROJECT_ID="..."

curl -X POST http://localhost:5000/api/themes \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Test Theme" \
  -F "primaryColor=#FF0000" \
  -F "project=$PROJECT_ID"
```

### Step 4: Get Theme ID and Create Team Member
```bash
# First, get theme ID from previous response
THEME_ID="..."

curl -X POST http://localhost:5000/api/team \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Test Member" \
  -F "role=Developer" \
  -F "workDetail=Testing" \
  -F "theme=$THEME_ID"
```

---

## 8. Useful Tools

### Get jq (JSON parser)
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Windows (via Chocolatey)
choco install jq
```

### Extract token from response
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')
```

### Pretty print response
```bash
curl -s http://localhost:5000/api/projects | jq .
```

### Save large response to file
```bash
curl -s http://localhost:5000/api/projects > projects.json
cat projects.json | jq .
```

---

## 9. Postman Collection

Import this into Postman for easier testing:

```json
{
  "info": {
    "name": "Project Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Admin Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/admin/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "admin", "login"]
        }
      }
    },
    {
      "name": "Create Project",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "name",
              "value": "Test Project",
              "type": "text"
            },
            {
              "key": "description",
              "value": "Test description",
              "type": "text"
            },
            {
              "key": "status",
              "value": "ongoing",
              "type": "text"
            },
            {
              "key": "image",
              "type": "file",
              "src": "path/to/image.jpg"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:5000/api/projects",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "projects"]
        }
      }
    }
  ]
}
```

---

## 10. Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* resource data */ },
  "count": 10  // For list endpoints
}
```

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Notes

- Replace `{TOKEN}`, `{PROJECT_ID}`, `{THEME_ID}`, `{MEMBER_ID}` with actual values
- Image uploads use multipart/form-data (`-F` flag in curl)
- JSON requests use application/json (`-H "Content-Type: application/json"`)
- All admin-only endpoints require valid JWT token
- Image files must be JPEG, PNG, GIF, or WebP
- Maximum file size is 5MB
- Images are stored in `backend/uploads/` directory
- Images are accessible at `http://localhost:5000/uploads/{filename}`
