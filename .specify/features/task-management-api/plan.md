# Implementation Plan: Task Management API

**Status:** Draft  
**Created:** 2025-11-09  
**Updated:** 2025-11-09

## Technical Context

### Technology Stack

- **Backend Framework**: Node.js with Express.js (as per TaskFlow context - Express or Nest.js, choosing Express for MVP simplicity)
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod for runtime schema validation (aligns with API Design Principles mentioning JSON Schema/Zod)
- **Authentication**: JWT tokens (existing auth system)
- **Testing**: Jest + Supertest for API testing
- **API Documentation**: OpenAPI 3.0 specification
- **Error Handling**: Custom error middleware with standardized error responses

### Architecture Decisions

- **RESTful API Design**: Follow REST conventions with resource-based URLs (`/api/projects/:projectId/tasks`)
- **Nested Resources**: Tasks are nested under projects (`/api/projects/:projectId/tasks`) to reflect hierarchical relationship
- **Pagination**: Cursor-based or offset-based pagination for task lists (default page size: 50, max: 100)
- **Filtering**: Query parameters for filtering by status and assigned user (`?status=pending&assignedTo=userId`)
- **Authorization Middleware**: Middleware to verify JWT and check project membership before task operations
- **Activity Logging**: Async logging to ActivityLog service after successful mutations
- **Database Indexing**: Indexes on `projectId`, `assignedTo`, `status`, and `createdAt` for efficient queries
- **Validation Layer**: Request validation using Zod schemas before controller logic
- **Error Responses**: Standardized error response format with appropriate HTTP status codes

### Dependencies

- **User Authentication API**: JWT token validation and user context extraction
- **Project Management API**: Project existence and membership validation
- **Activity Logging Service**: Async service call to log task creation, updates, and deletions
- **MongoDB Database**: Persistent storage for Task entities
- **Express.js**: Web framework for API endpoints
- **Mongoose**: ODM for MongoDB data modeling and validation
- **Zod**: Runtime schema validation for request/response validation
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for API testing

### Constraints

- **Performance**: Task list queries must return in under 500ms for projects with up to 1000 tasks
- **Scalability**: Must support projects with up to 10,000 tasks without performance degradation
- **Data Consistency**: Use MongoDB transactions for operations that require atomicity (e.g., task creation with activity log)
- **Concurrent Updates**: Last-write-wins strategy for concurrent task updates (both updates logged)
- **Authorization**: All endpoints require authentication; project membership validation required
- **Input Limits**: Task title max 200 characters, description max 5000 characters
- **Pagination**: Default page size 50, maximum 100 tasks per page

## Constitution Check

### Principle Compliance

#### 1. Spec-Driven Development
- [x] Specification is complete and technology-agnostic
- [x] All requirements are testable

#### 2. RESTful API Design
- [x] API endpoints follow RESTful conventions
- [x] Standard HTTP methods and status codes used
- **Implementation**: Use resource-based URLs (`/api/projects/:projectId/tasks`), standard HTTP methods (GET, POST, PUT, DELETE), and appropriate status codes (200, 201, 400, 403, 404, 500)

#### 3. Input Validation & Security
- [x] Input validation planned
- [x] Authentication/authorization planned
- **Implementation**: Zod schemas for request validation, JWT middleware for authentication, project membership check for authorization

#### 4. Activity Logging
- [x] Activity logging planned for all mutations
- **Implementation**: Async activity logging after successful task creation, update, and deletion operations

#### 5. Error Handling
- [x] Error handling strategy defined
- [x] Appropriate HTTP status codes planned
- **Implementation**: Standardized error response format with appropriate HTTP status codes (400 for validation errors, 403 for unauthorized, 404 for not found, 500 for server errors)

#### 6. Performance Targets
- [x] Performance targets defined
- [x] Optimization strategy planned
- **Implementation**: Database indexing on frequently queried fields, pagination for large result sets, query optimization for filtered lists

#### 7. Data Consistency
- [x] Data consistency strategy defined
- [x] Concurrent update handling planned
- **Implementation**: MongoDB transactions for atomic operations, last-write-wins for concurrent updates, both updates logged to activity feed

#### 8. Testability
- [x] Requirements are testable
- [x] Testing strategy defined
- **Implementation**: Jest + Supertest for API endpoint testing, unit tests for validation logic, integration tests for database operations

### Gate Evaluation

- [x] All principles compliant or justified
- [x] No critical violations
- [x] Ready to proceed to Phase 0

## Phase 0: Research

✅ **Complete** - See `research.md` for detailed research findings and technology decisions.

### Research Tasks

Based on the Technical Context, all technology choices are defined in the TaskFlow project context. No critical research tasks were needed as:

1. **Express.js vs Nest.js**: Express.js chosen for MVP simplicity (already decided in context)
2. **Zod vs JSON Schema**: Zod chosen for runtime validation (mentioned in API Design Principles)
3. **Pagination Strategy**: Offset-based pagination for simplicity (can be enhanced later)
4. **Database Indexing**: Standard MongoDB indexing strategies apply
5. **Error Handling**: Standard Express.js error handling patterns

### Research Findings

All technology decisions are based on the existing TaskFlow project context. No additional research required for MVP implementation.

**Key Decisions:**
- **Express.js**: Chosen over Nest.js for MVP simplicity and faster development
- **Zod**: Chosen for runtime validation aligning with API Design Principles
- **Nested Resources**: Tasks nested under projects (`/api/projects/:projectId/tasks`) for clear resource hierarchy
- **Offset Pagination**: Simple offset/limit pagination for MVP (can upgrade to cursor-based later)
- **Last-Write-Wins**: Chosen for concurrent update handling (simpler than optimistic locking for MVP)
- **Async Activity Logging**: Chosen to avoid blocking API responses

## Phase 1: Design & Contracts

### Data Model

✅ **Complete** - See `data-model.md` for detailed entity definitions, relationships, and validation rules.

**Key Components:**
- Task entity schema with all fields and validation rules
- Database indexes for performance optimization
- Mongoose schema definition
- Relationship definitions (Task → Project, Task → User)
- Validation rules and constraints

### API Contracts

✅ **Complete** - See `contracts/tasks-api.yaml` for OpenAPI 3.0 specifications for all endpoints.

**Endpoints Defined:**
- `POST /api/projects/{projectId}/tasks` - Create task
- `GET /api/projects/{projectId}/tasks` - List tasks (with filtering and pagination)
- `GET /api/projects/{projectId}/tasks/{taskId}` - Get task details
- `PUT /api/projects/{projectId}/tasks/{taskId}` - Update task
- `DELETE /api/projects/{projectId}/tasks/{taskId}` - Delete task

**Components:**
- Request/response schemas
- Error response schemas
- Security schemes (JWT authentication)
- Validation rules and constraints

### Quick Start

✅ **Complete** - See `quickstart.md` for test scenarios and API usage examples.

**Contents:**
- API endpoint documentation
- Test scenarios with request/response examples
- Error scenario examples
- Test cases for all operations
- Integration testing flows
- Performance and security testing guidelines

## Phase 2: Implementation Strategy

✅ **Complete** - Core functionality implemented. See `tasks.md` for detailed task breakdown.

### Implementation Phases

1. **Phase 1-2**: Foundation (setup and shared infrastructure) - ✅ Complete
2. **Phase 3**: User Stories 1-5 (P1) - Core functionality - ✅ Complete
3. **Phase 4**: User Stories 6-8 (P2) - Enhanced management - ✅ Complete
4. **Phase 5**: User Stories 9-10 (P3) - Advanced filtering - ✅ Complete
5. **Phase 6**: Polish and cross-cutting concerns - ✅ Complete
6. **Phase 7**: Production MVP Must-Have Features - ⏳ In Progress

### Dependencies

- **Phase 1-2**: Must complete before any user story implementation - ✅ Complete
- **Phase 3-6**: Core functionality - ✅ Complete
- **Phase 7**: Production readiness features - ⏳ In Progress

## Phase 7: Production MVP Must-Have Features

**Goal**: Add essential security, reliability, and task management features required for production MVP

### Critical Security & Reliability Features

#### 7.1 Rate Limiting
**Status**: ⏳ Pending  
**Priority**: Critical  
**Description**: Implement rate limiting to prevent API abuse and DoS attacks

**Implementation**:
- Install `express-rate-limit` package
- Configure rate limiter middleware (100 requests per 15 minutes per IP)
- Apply to all API routes
- Add appropriate error responses

**Dependencies**: None

#### 7.2 Security Headers (Helmet)
**Status**: ⏳ Pending  
**Priority**: Critical  
**Description**: Add security headers to protect against common web vulnerabilities

**Implementation**:
- Install `helmet` package
- Configure Helmet middleware with appropriate security headers
- Apply globally to all routes

**Dependencies**: None

#### 7.3 Request Size Limits
**Status**: ⏳ Pending  
**Priority**: Critical  
**Description**: Explicitly set request body size limits to prevent large payload attacks

**Implementation**:
- Configure `express.json()` with explicit `limit: '10mb'`
- Configure `express.urlencoded()` with explicit `limit: '10mb'`
- Add error handling for payload too large errors

**Dependencies**: None

#### 7.4 Environment Variable Validation
**Status**: ⏳ Pending  
**Priority**: Critical  
**Description**: Validate required environment variables on application startup

**Implementation**:
- Create environment validation utility using Zod
- Validate `MONGODB_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV`
- Fail fast with clear error messages if required vars missing
- Add to server startup before database connection

**Dependencies**: None

#### 7.5 Graceful Shutdown
**Status**: ⏳ Pending  
**Priority**: Critical  
**Description**: Implement graceful shutdown to handle SIGTERM/SIGINT signals

**Implementation**:
- Add signal handlers for SIGTERM and SIGINT
- Close database connections gracefully
- Stop accepting new requests
- Wait for in-flight requests to complete
- Exit process cleanly

**Dependencies**: Database connection module

### Essential Task Management Features

#### 7.6 Task Due Dates
**Status**: ⏳ Pending  
**Priority**: High  
**Description**: Add due date field to tasks for deadline tracking

**Implementation**:
- Add `dueDate` field to Task model (Date, optional, indexed)
- Update Zod validation schemas to include dueDate
- Update service methods to handle dueDate
- Add dueDate to create/update endpoints
- Add filtering by dueDate (overdue, upcoming, etc.)

**Dependencies**: Task model, validators, service layer

#### 7.7 Task Priorities
**Status**: ⏳ Pending  
**Priority**: High  
**Description**: Add priority field to tasks for work prioritization

**Implementation**:
- Add `priority` field to Task model (enum: low, medium, high, urgent, default: medium)
- Update Zod validation schemas to include priority
- Update service methods to handle priority
- Add priority to create/update endpoints
- Add filtering by priority

**Dependencies**: Task model, validators, service layer

#### 7.8 Soft Delete
**Status**: ⏳ Pending  
**Priority**: High  
**Description**: Implement soft delete instead of hard delete to prevent data loss

**Implementation**:
- Add `deletedAt` field to Task model (Date, nullable, indexed)
- Update delete service method to set `deletedAt` instead of removing document
- Update list/get queries to exclude soft-deleted tasks (`deletedAt: null`)
- Add restore endpoint (optional, for future)
- Update activity logging to reflect soft delete

**Dependencies**: Task model, service layer, controllers

### Implementation Tasks

See `tasks.md` Phase 7 section for detailed task breakdown.

## Phase 8: User Authentication

**Goal**: Implement user signup and login functionality to replace manual token generation

### 8.1 User Model & Database
**Status**: ✅ Complete  
**Priority**: Critical  
**Description**: Create User model with password hashing and authentication fields

**Implementation**:
- Created User Mongoose model with email, password, firstName, lastName, role fields
- Implemented password hashing using bcryptjs (10 salt rounds)
- Added password comparison method
- Added user validation (email format, password strength)
- Implemented toJSON method to exclude password from responses

### 8.2 Authentication Service
**Status**: ✅ Complete  
**Priority**: Critical  
**Description**: Create authentication service with signup, login, and token management

**Implementation**:
- Created authService with signup, login, refreshToken, getCurrentUser methods
- Implemented JWT token generation (access token: 24h, refresh token: 7d)
- Added password validation and hashing
- Implemented user existence checks
- Added account status validation (isActive)

### 8.3 Authentication Endpoints
**Status**: ✅ Complete  
**Priority**: Critical  
**Description**: Create RESTful authentication endpoints

**Implementation**:
- POST /api/auth/signup - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh - Refresh access token
- GET /api/auth/me - Get current user (protected)
- POST /api/auth/logout - Logout user (protected)
- Added Zod validation schemas for all auth endpoints
- Implemented proper error handling and response formatting

### 8.4 Frontend Authentication UI
**Status**: ✅ Complete  
**Priority**: Critical  
**Description**: Create login and signup pages with form validation

**Implementation**:
- Created Login.jsx component with email/password form
- Created Signup.jsx component with full registration form
- Added client-side validation (email format, password strength, password match)
- Implemented token storage (access token in sessionStorage, refresh token in localStorage)
- Added user info storage in sessionStorage
- Updated API client with auth methods (signup, login, refreshToken, getCurrentUser, logout)
- Updated App.jsx with login/signup routes
- Updated Navbar with user info display and logout functionality
- Updated RequireToken to redirect to /login instead of /settings

### 8.5 Security Features
**Status**: ✅ Complete  
**Priority**: Critical  
**Description**: Implement security best practices for authentication

**Implementation**:
- Password requirements: min 8 chars, uppercase, lowercase, number
- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration (24h access, 7d refresh)
- Email validation and uniqueness check
- Account status check (isActive flag)
- Secure token storage (sessionStorage for access, localStorage for refresh)

## Notes

- All technology choices align with existing TaskFlow project context
- Express.js chosen for MVP simplicity (can migrate to Nest.js later if needed)
- Zod validation aligns with API Design Principles
- Activity logging is async to avoid blocking API responses
- Database indexes will be created on: projectId, assignedTo, status, createdAt
- Pagination uses offset/limit for MVP **simplicity**
- **Production MVP features (Phase 7) are critical for deployment readiness**
- **User authentication (Phase 8) replaces manual token generation with proper signup/login flow**
