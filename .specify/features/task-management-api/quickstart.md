# Quick Start: Task Management API

**Date:** 2025-11-09  
**Feature:** Task Management API

## Overview

This document provides quick start examples and test scenarios for the Task Management API. Use these examples to understand how to interact with the API and test the functionality.

## Prerequisites

- Valid JWT authentication token
- Access to a project (as admin or member)
- API base URL: `/api`

## Authentication

All API requests require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Base **URL**
```
/api/projects/{projectId}/tasks
```

### Endpoints
- `POST /api/projects/{projectId}/tasks` - Create a task
- `GET /api/projects/{projectId}/tasks` - List tasks
- `GET /api/projects/{projectId}/tasks/{taskId}` - Get task details
- `PUT /api/projects/{projectId}/tasks/{taskId}` - Update a task
- `DELETE /api/projects/{projectId}/tasks/{taskId}` - Delete a task

## Test Scenarios

### Scenario 1: Create a Task

**Request:**
```http
POST /api/projects/507f1f77bcf86cd799439011/tasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication to the API",
  "status": "pending",
  "assignedTo": "507f1f77bcf86cd799439012"
}
```

**Response (201 Created):**
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

### Scenario 2: List Tasks

**Request:**
```http
GET /api/projects/507f1f77bcf86cd799439011/tasks?status=pending&page=1&limit=50
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "data": [
    {
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
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### Scenario 3: Get Task Details

**Request:**
```http
GET /api/projects/507f1f77bcf86cd799439011/tasks/507f1f77bcf86cd799439013
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
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

### Scenario 4: Update Task Status

**Request:**
```http
PUT /api/projects/507f1f77bcf86cd799439011/tasks/507f1f77bcf86cd799439013
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "in-progress"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "**507f1f77bcf86cd799439013**",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "status": "in-progress",
    "projectId": "507f1f77bcf86cd799439011",
    "assignedTo": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439010",
    "createdAt": "2025-11-09T10:00:00.000Z",
    "updatedAt": "2025-11-09T10:15:00.000Z"
  }
}
```

### Scenario 5: Filter Tasks by Assigned User

**Request:**
```http
GET /api/projects/507f1f77bcf86cd799439011/tasks?assignedTo=507f1f77bcf86cd799439012
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication to the API",
      "status": "in-progress",
      "projectId": "507f1f77bcf86cd799439011",
      "assignedTo": "507f1f77bcf86cd799439012",
      "createdBy": "507f1f77bcf86cd799439010",
      "createdAt": "2025-11-09T10:00:00.000Z",
      "updatedAt": "2025-11-09T10:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### Scenario 6: Delete Task

**Request:**
```http
DELETE /api/projects/507f1f77bcf86cd799439011/tasks/507f1f77bcf86cd799439013
Authorization: Bearer <jwt-token>
```

**Response (204 No Content):**
```
(empty body)
```

## Error Scenarios

### Error 1: Validation Error

**Request:**
```http
POST /api/projects/507f1f77bcf86cd799439011/tasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "description": "Task without title"
}
```

**Response (400 Bad Request):**
```json
{
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "title": "Title is required"
    }
  }
}
```

### Error 2: Unauthorized Access

**Request:**
```http
GET /api/projects/507f1f77bcf86cd799439011/tasks
Authorization: Bearer <invalid-token>
```

**Response (403 Forbidden):**
```json
{
  "error": {
    "message": "You do not have permission to perform this action",
    "code": "FORBIDDEN"
  }
}
```

### Error 3: Task Not Found

**Request:**
```http
GET /api/projects/507f1f77bcf86cd799439011/tasks/507f1f77bcf86cd799439999
Authorization: Bearer <jwt-token>
```

**Response (404 Not Found):**
```json
{
  "error": {
    "message": "Task not found",
    "code": "NOT_FOUND"
  }
}
```

### Error 4: Invalid User Assignment

**Request:**
```http
POST /api/projects/507f1f77bcf86cd799439011/tasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "New task",
  "assignedTo": "507f1f77bcf86cd799439999"
}
```

**Response (400 Bad Request):**
```json
{
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "assignedTo": "User is not a member of this project"
    }
  }
}
```

## Test Cases

### Test Case 1: Create Task with Required Fields Only

```javascript
// Test: Create task with only title
const response = await fetch('/api/projects/507f1f77bcf86cd799439011/tasks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New task'
  })
});

// Expected: 201 Created with default status "pending"
```

### Test Case 2: Create Task with All Fields

```javascript
// Test: Create task with all fields
const response = await fetch('/api/projects/507f1f77bcf86cd799439011/tasks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Complete task',
    description: 'Task description',
    status: 'pending',
    assignedTo: '507f1f77bcf86cd799439012'
  })
});

// Expected: 201 Created with all fields
```

### Test Case 3: List Tasks with Pagination

```javascript
// Test: List tasks with pagination
const response = await fetch('/api/projects/507f1f77bcf86cd799439011/tasks?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Expected: 200 OK with pagination metadata
```

### Test Case 4: Filter Tasks by Status

```javascript
// Test: Filter tasks by status
const response = await fetch('/api/projects/507f1f77bcf86cd799439011/tasks?status=in-progress', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Expected: 200 OK with only in-progress tasks
```

### Test Case 5: Update Task Status

```javascript
// Test: Update task status
const response = await fetch('/api/projects/507f1f77bcf86cd799439011/tasks/507f1f77bcf86cd799439013', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'completed'
  })
});

// Expected: 200 OK with updated task
```

### Test Case 6: Delete Task

```javascript
// Test: Delete task
const response = await fetch('/api/projects/507f1f77bcf86cd799439011/tasks/507f1f77bcf86cd799439013', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Expected: 204 No Content
```

## Integration Testing

### Test Flow: Complete Task Lifecycle

1. **Create Task**: Create a new task with status "pending"
2. **List Tasks**: Verify task appears in task list
3. **Get Task**: Retrieve task details
4. **Update Status**: Change status to "in-progress"
5. **Filter Tasks**: Filter tasks by status "in-progress"
6. **Update Task**: Update task description
7. **Complete Task**: Change status to "completed"
8. **Delete Task**: Delete the task
9. **Verify Deletion**: Confirm task is deleted (404 on get)

## Performance Testing

### Test: List Tasks with Large Dataset

- Create 1000 tasks in a project
- List tasks with pagination (50 per page)
- Verify response time is under 500ms
- Test filtering with large dataset

### Test: Concurrent Updates

- Create a task
- Update task from multiple clients simultaneously
- Verify last-write-wins behavior
- Verify both updates are logged

## Security Testing

### Test: Unauthorized Access

- Attempt to access tasks without authentication
- Attempt to access tasks from non-member user
- Attempt to create task as non-admin user
- Verify all requests return 403 Forbidden

### Test: Input Validation

- Attempt to create task with invalid data
- Attempt to assign task to non-member user
- Attempt to set invalid status value
- Verify all requests return 400 Bad Request with validation errors

