# Postman Guide: Task Management API

## Creating a Task

### Step 1: Set Up the Request

1. **Method**: `POST`
2. **URL**: `http://localhost:3000/api/projects/{projectId}/tasks`
   - Replace `{projectId}` with an actual MongoDB ObjectId (24-character hex string)
   - Example: `http://localhost:3000/api/projects/507f1f77bcf86cd799439011/tasks`

### Step 2: Set Headers

In Postman, go to the **Headers** tab and add:

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer YOUR_JWT_TOKEN_HERE` |
| `Content-Type` | `application/json` |

**Important**: Replace `YOUR_JWT_TOKEN_HERE` with your actual JWT token (see Step 3 below).

### Step 3: Get Your JWT Token

The JWT token should contain:
- `userId` or `id`: User ID (MongoDB ObjectId)
- `email`: User email (optional)
- `role`: User role (`Admin` or `Member`)

**Option A: If you have an authentication endpoint:**
1. Call your login/authentication endpoint first
2. Copy the JWT token from the response
3. Use it in the Authorization header

**Option B: Generate a test token (for development):**

You can create a simple script to generate a test token. Create a file `generate-token.js`:

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Example user data
const user = {
  id: '507f1f77bcf86cd799439010', // Your user ID (MongoDB ObjectId)
  email: 'admin@example.com',
  role: 'Admin' // or 'Member'
};

const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
console.log('JWT Token:', token);
```

Run it:
```bash
node generate-token.js
```

### Step 4: Request Body

Go to the **Body** tab in Postman:
1. Select **raw**
2. Select **JSON** from the dropdown
3. Paste the following payload:

#### Minimal Payload (Required fields only):
```json
{
  "title": "Implement user authentication"
}
```

#### Complete Payload (All fields):
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication to the API",
  "status": "pending",
  "assignedTo": "507f1f77bcf86cd799439012"
}
```

#### Field Descriptions:

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `title` | string | **Yes** | Task title | 1-200 characters |
| `description` | string | No | Task description | Max 5000 characters |
| `status` | string | No | Task status | `pending`, `in-progress`, `completed`, `cancelled` (default: `pending`) |
| `assignedTo` | string | No | User ID to assign task to | Valid MongoDB ObjectId (must be project member) |

### Step 5: Send the Request

Click **Send** in Postman.

### Expected Response

**Success (201 Created):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "status": "pending",
    "projectId": "507f1f77bcf86cd799439011",
    "assignedTo": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439010",
    "createdAt": "2025-11-09T10:00:00.000Z",
    "updatedAt": "2025-11-09T10:00:00.000Z"
  }
}
```

**Error Examples:**

**401 Unauthorized (No/Invalid Token):**
```json
{
  "error": {
    "message": "Invalid or expired token",
    "code": "UNAUTHORIZED"
  }
}
```

**400 Bad Request (Validation Error):**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "title": "Title is required"
    }
  }
}
```

**403 Forbidden (Not Project Member):**
```json
{
  "error": {
    "message": "You do not have permission to perform this action",
    "code": "FORBIDDEN"
  }
}
```

## Postman Collection Setup

### Environment Variables (Recommended)

Create a Postman Environment with these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `jwt_token` | `your-token-here` | `your-token-here` |
| `project_id` | `507f1f77bcf86cd799439011` | `507f1f77bcf86cd799439011` |
| `user_id` | `507f1f77bcf86cd799439010` | `507f1f77bcf86cd799439010` |

Then use in your request:
- **URL**: `{{base_url}}/api/projects/{{project_id}}/tasks`
- **Authorization Header**: `Bearer {{jwt_token}}`

### Pre-request Script (Auto-set Token)

You can add a pre-request script to automatically set the token:

```javascript
// Get token from environment or generate it
const token = pm.environment.get("jwt_token");
pm.request.headers.add({
    key: "Authorization",
    value: `Bearer ${token}`
});
```

## Quick Test Examples

### Example 1: Create Simple Task
```json
{
  "title": "Review code changes"
}
```

### Example 2: Create Task with Description
```json
{
  "title": "Fix authentication bug",
  "description": "Users are unable to login with valid credentials"
}
```

### Example 3: Create Task and Assign
```json
{
  "title": "Implement user dashboard",
  "description": "Create dashboard UI with task statistics",
  "status": "pending",
  "assignedTo": "507f1f77bcf86cd799439012"
}
```

### Example 4: Create In-Progress Task
```json
{
  "title": "Write API documentation",
  "description": "Document all endpoints with examples",
  "status": "in-progress"
}
```

## Troubleshooting

### Issue: "Invalid or expired token"
- **Solution**: Generate a new JWT token with valid user data
- Check that the token includes `id` or `userId` field
- Verify the JWT_SECRET matches between token generation and server

### Issue: "Validation failed"
- **Solution**: Check that:
  - `title` is provided and not empty
  - `title` is max 200 characters
  - `description` is max 5000 characters
  - `status` is one of: `pending`, `in-progress`, `completed`, `cancelled`
  - `assignedTo` is a valid 24-character MongoDB ObjectId

### Issue: "You do not have permission"
- **Solution**: 
  - Ensure your user role is `Admin` (for creating tasks)
  - Verify you're a member of the project
  - Check that the `projectId` in the URL is correct

### Issue: "Project not found" or 404
- **Solution**: 
  - Verify the `projectId` exists in your database
  - Ensure the projectId is a valid MongoDB ObjectId format (24 hex characters)

## Testing Other Endpoints

### List Tasks
- **Method**: `GET`
- **URL**: `{{base_url}}/api/projects/{{project_id}}/tasks`
- **Query Params** (optional):
  - `status`: Filter by status (`pending`, `in-progress`, `completed`, `cancelled`)
  - `assignedTo`: Filter by user ID
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50, max: 100)

### Get Task Details
- **Method**: `GET`
- **URL**: `{{base_url}}/api/projects/{{project_id}}/tasks/{{task_id}}`

### Update Task
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/projects/{{project_id}}/tasks/{{task_id}}`
- **Body**: Same as create, but all fields optional

### Delete Task
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/projects/{{project_id}}/tasks/{{task_id}}`
- **Note**: Only Admins can delete tasks

