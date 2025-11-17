# TaskFlow - Task Management API

Task Management API for the TaskFlow project management platform.

## Quick Start (API + UI)

1) Install API deps and run:
```bash
npm install
npm run dev
```
Defaults to `http://localhost:3000`. Ensure `MONGODB_URI` and `JWT_SECRET` are set in your environment.

2) Generate a JWT token for testing (optional helper):
```bash
node scripts/generate-token.js
```
Copy the token for UI usage.

3) UI Setup:
```bash
cd client
npm install
npm run dev
```
UI runs at `http://localhost:5173`.

4) In the UI:
- Open Settings
- Set API Base URL to `http://localhost:3000`
- Paste the JWT token
- Navigate to `/projects/:projectId/tasks`

### CORS
The API enables CORS for local development. Configure origins via `CORS_ORIGIN`, comma-separated, e.g.:
```bash
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```

## Features

- Create, read, update, and delete tasks within projects
- Assign tasks to project members
- Filter tasks by status and assigned user
- Pagination support for large task lists
- Activity logging for all task operations
- JWT-based authentication
- Input validation and sanitization

## Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose ODM**
- **Zod** for request validation
- **JWT** for authentication
- **Jest + Supertest** for testing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing

## API Endpoints

### Tasks

- `POST /api/projects/:projectId/tasks` - Create a task
- `GET /api/projects/:projectId/tasks` - List tasks (with filtering and pagination)
- `GET /api/projects/:projectId/tasks/:taskId` - Get task details
- `PUT /api/projects/:projectId/tasks/:taskId` - Update a task
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete a task

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── validators/     # Zod validation schemas
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## License

ISC

