# Frontend-Backend Integration Tasks

**Feature:** Frontend-Backend Integration  
**Created:** 2025-11-16  
**Status:** In Progress

## Phase 1: API Client Setup

- [ ] T1 Create `src/lib/apiClient.ts` with base request function
- [ ] T2 Add authentication header injection
- [ ] T3 Implement API error handling with proper error types
- [ ] T4 Add token refresh logic (auto-refresh on 401)
- [ ] T5 Create API method wrappers (auth, tasks, dashboard)
- [ ] T6 Add request/response interceptors
- [ ] T7 Handle environment configuration (API base URL)

## Phase 2: Data Mapping & Transformation

- [ ] T8 Create `src/lib/mappers.ts` with status mapping functions
  - [ ] T8.1 Map backend status to frontend format
  - [ ] T8.2 Map frontend status to backend format
- [ ] T9 Create priority mapping functions
  - [ ] T9.1 Map backend priority to frontend format
  - [ ] T9.2 Map frontend priority to backend format
- [ ] T10 Create task transformation functions
  - [ ] T10.1 Transform backend task to frontend format (_id → id)
  - [ ] T10.2 Transform frontend task to backend format (id → _id)
  - [ ] T10.3 Handle date format transformations
- [ ] T11 Update TypeScript types to match backend responses

## Phase 3: AppContext Integration

- [ ] T12 Update login function to call `/api/auth/login`
- [ ] T13 Update signup function to call `/api/auth/signup`
- [ ] T14 Update logout function to call `/api/auth/logout`
- [ ] T15 Add getCurrentUser function for token validation
- [ ] T16 Replace mock tasks state with API calls
- [ ] T17 Add fetchTasks function that calls `/api/projects/:projectId/tasks`
- [ ] T18 Update addTask to call POST `/api/projects/:projectId/tasks`
- [ ] T19 Update updateTask to call PUT `/api/projects/:projectId/tasks/:id`
- [ ] T20 Update deleteTask to call DELETE `/api/projects/:projectId/tasks/:id`
- [ ] T21 Add projectId state management in context
- [ ] T22 Add loading states for async operations
- [ ] T23 Add error handling in context methods

## Phase 4: Route & Project ID Handling

- [ ] T24 Add projectId to AppContext
- [ ] T25 Create project selection component/page (if needed)
- [ ] T26 Update settings page to include projectId configuration
- [ ] T27 Add projectId validation before API calls
- [ ] T28 Update all task API calls to include projectId
- [ ] T29 Handle missing projectId scenarios with user-friendly messages
- [ ] T30 Update protected routes to check for projectId

## Phase 5: Component Updates - Pages

- [ ] T31 Update LoginPage to use real API (already using context)
- [ ] T32 Update SignupPage to use real API (already using context)
- [ ] T33 Update TaskListPage
  - [ ] T33.1 Replace mock tasks with API fetch
  - [ ] T33.2 Add loading skeleton state
  - [ ] T33.3 Add error display
  - [ ] T33.4 Update filters to use API query parameters
  - [ ] T33.5 Implement real pagination from API response
- [ ] T34 Update TaskDetailPage
  - [ ] T34.1 Fetch task from API instead of context
  - [ ] T34.2 Add loading state
  - [ ] T34.3 Add error handling
- [ ] T35 Update TaskFormPage
  - [ ] T35.1 Integrate with create API endpoint
  - [ ] T35.2 Integrate with update API endpoint
  - [ ] T35.3 Add form validation
  - [ ] T35.4 Handle success/error feedback
- [ ] T36 Update DashboardPage
  - [ ] T36.1 Replace mock calculations with `/api/projects/:projectId/dashboard` call
  - [ ] T36.2 Add loading state
  - [ ] T36.3 Map backend dashboard response to frontend format
  - [ ] T36.4 Update charts to use real data
- [ ] T37 Update SettingsPage
  - [ ] T37.1 Add projectId input field
  - [ ] T37.2 Store projectId in localStorage
  - [ ] T37.3 Keep API base URL configuration

## Phase 6: Testing & Refinement

- [ ] T38 Test login flow end-to-end
- [ ] T39 Test signup flow end-to-end
- [ ] T40 Test task creation
- [ ] T41 Test task listing with filters
- [ ] T42 Test task update
- [ ] T43 Test task deletion
- [ ] T44 Test dashboard data loading
- [ ] T45 Test pagination
- [ ] T46 Test error handling (network errors, validation errors)
- [ ] T47 Test token refresh flow
- [ ] T48 Fix any data mapping issues
- [ ] T49 Verify all status/priority mappings work correctly
- [ ] T50 Test with real backend data

## Task Summary

**Total Tasks:** 50
- Phase 1 (API Client): 7 tasks
- Phase 2 (Data Mapping): 4 tasks
- Phase 3 (Context Integration): 12 tasks
- Phase 4 (Route/Project ID): 7 tasks
- Phase 5 (Component Updates): 7 tasks
- Phase 6 (Testing): 13 tasks

