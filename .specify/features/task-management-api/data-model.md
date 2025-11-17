# Data Model: Task Management API

**Date:** 2025-11-09  
**Feature:** Task Management API

## Overview

This document defines the data model for the Task Management API, including entity definitions, relationships, validation rules, and database indexes.

## Entities

### Task

A work unit within a project that can be assigned to a user and tracked through status updates.

#### Schema Definition

```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  title: string,                    // Required, max 200 characters
  description: string,              // Optional, max 5000 characters
  status: string,                   // Required, enum: ['pending', 'in-progress', 'completed', 'cancelled']
  projectId: ObjectId,              // Required, reference to Project
  assignedTo: ObjectId,             // Optional, reference to User
  createdBy: ObjectId,              // Required, reference to User (task creator)
  createdAt: Date,                  // Auto-generated timestamp
  updatedAt: Date                   // Auto-updated timestamp
}
```

#### Field Definitions

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Yes | Auto-generated | Unique task identifier |
| `title` | String | Yes | Max 200 chars | Task title |
| `description` | String | No | Max 5000 chars | Task description |
| `status` | String | Yes | Enum values | Task status |
| `projectId` | ObjectId | Yes | Valid Project ID | Project this task belongs to |
| `assignedTo` | ObjectId | No | Valid User ID, must be project member | User assigned to task |
| `createdBy` | ObjectId | Yes | Valid User ID | User who created the task |
| `createdAt` | Date | Yes | Auto-generated | Task creation timestamp |
| `updatedAt` | Date | Yes | Auto-updated | Task last update timestamp |

#### Status Values

- `pending`: Task is created but not yet started (default)
- `in-progress`: Task is actively being worked on
- `completed`: Task is finished
- `cancelled`: Task is cancelled and will not be completed

#### Validation Rules

1. **Title Validation**:
   - Required field
   - Minimum length: 1 character
   - Maximum length: 200 characters
   - Must be non-empty after trimming whitespace

2. **Description Validation**:
   - Optional field
   - Maximum length: 5000 characters
   - Can be empty or null

3. **Status Validation**:
   - Required field
   - Must be one of: `pending`, `in-progress`, `completed`, `cancelled`
   - Default value: `pending`

4. **Project ID Validation**:
   - Required field
   - Must be a valid MongoDB ObjectId
   - Must reference an existing Project
   - Project must exist and be accessible

5. **Assigned To Validation**:
   - Optional field
   - If provided, must be a valid MongoDB ObjectId
   - Must reference an existing User
   - User must be a member of the project (enforced at API level)

6. **Created By Validation**:
   - Required field
   - Must be a valid MongoDB ObjectId
   - Must reference an existing User
   - Automatically set from JWT token

#### Database Indexes

1. **Primary Index**: `_id` (automatically created by MongoDB)

2. **Single Field Indexes**:
   - `projectId`: For filtering tasks by project
   - `assignedTo`: For filtering tasks by assigned user
   - `status`: For filtering tasks by status
   - `createdAt`: For sorting and pagination

3. **Compound Indexes**:
   - `{projectId: 1, status: 1}`: For filtering tasks by project and status
   - `{projectId: 1, assignedTo: 1}`: For filtering tasks by project and assigned user
   - `{projectId: 1, status: 1, assignedTo: 1}`: For complex filtered queries
   - `{projectId: 1, createdAt: -1}`: For sorting tasks by creation date within a project

#### Mongoose Schema

```javascript
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Title cannot be empty'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: 5000,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ projectId: 1, assignedTo: 1 });
taskSchema.index({ projectId: 1, status: 1, assignedTo: 1 });
taskSchema.index({ projectId: 1, createdAt: -1 });
```

## Relationships

### Task → Project (Many-to-One)

- **Relationship**: Each task belongs to exactly one project
- **Foreign Key**: `projectId` references `Project._id`
- **Cascade Behavior**: If project is deleted, tasks should be deleted (enforced at API level)
- **Validation**: Project must exist before task creation

### Task → User (Assigned To) (Many-to-One, Optional)

- **Relationship**: Each task can be assigned to one user (optional)
- **Foreign Key**: `assignedTo` references `User._id`
- **Validation**: User must be a member of the project (enforced at API level)
- **Cascade Behavior**: If user is deleted, tasks can remain unassigned (set to null)

### Task → User (Created By) (Many-to-One)

- **Relationship**: Each task is created by one user
- **Foreign Key**: `createdBy` references `User._id`
- **Validation**: User must exist and be authenticated
- **Cascade Behavior**: If user is deleted, `createdBy` can remain as reference (historical data)

## Referenced Entities

### Project (Existing Entity)

Tasks reference projects through `projectId`. Projects are managed by the Project Management API.

**Key Fields:**
- `_id`: Project identifier
- `name`: Project name
- `owner`: Project owner (User reference)
- `members`: Array of project members (User references)

### User (Existing Entity)

Tasks reference users through `assignedTo` and `createdBy`. Users are managed by the User Management API.

**Key Fields:**
- `_id`: User identifier
- `email`: User email
- `name`: User name
- `role`: User role (Admin or Member)

## Data Constraints

### Uniqueness Constraints

- No uniqueness constraints on Task fields (multiple tasks can have the same title, status, etc.)

### Referential Integrity

- `projectId` must reference an existing Project
- `assignedTo` must reference an existing User (if provided)
- `createdBy` must reference an existing User

### Business Rules

1. **Task Assignment**: A task can only be assigned to a user who is a member of the project
2. **Status Transitions**: All status transitions are allowed (no restrictions)
3. **Task Deletion**: Only project administrators can delete tasks
4. **Task Updates**: Project administrators can update all fields; assigned users can only update status

## Data Volume Assumptions

- **Tasks per Project**: Up to 10,000 tasks per project
- **Total Tasks**: No hard limit, but optimized for projects with up to 10,000 tasks
- **Task Queries**: Primarily filtered by project, with optional filters by status and assigned user

## Performance Considerations

1. **Indexing**: All frequently queried fields are indexed
2. **Pagination**: Task lists are paginated (default 50, max 100 per page)
3. **Query Optimization**: Compound indexes support common filtered queries
4. **Projection**: Only required fields are returned in list queries

## Migration Considerations

- **Initial Schema**: No migration required for initial implementation
- **Future Enhancements**: Schema can be extended with additional fields (e.g., dueDate, priority, labels)
- **Index Management**: Indexes can be added/modified without data migration

## Security Considerations

1. **Data Access**: Tasks are only accessible to project members
2. **Authorization**: Task creation, updates, and deletion require appropriate permissions
3. **Input Sanitization**: All user input is validated and sanitized
4. **SQL Injection**: Not applicable (MongoDB uses parameterized queries via Mongoose)

