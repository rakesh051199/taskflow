# Frontend-Backend Integration Plan

**Status:** In Progress  
**Created:** 2025-11-16  
**Feature:** Integrate Figma-generated TypeScript frontend with existing Node.js backend

## Overview

Integrate the new Figma Make-generated TypeScript frontend (Radix UI + Tailwind CSS) with the existing Node.js/Express backend API, replacing mock data with real API calls and ensuring full end-to-end functionality.

## Current State Analysis

### Frontend (New - Figma Generated)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI components (shadcn/ui)
- **State**: AppContext with mock data
- **Routing**: HashRouter with flat routes (/tasks, /dashboard, /login)
- **Data**: Mock data in `lib/mockData.ts`
- **Status Values**: "Pending", "In Progress", "Completed", "Cancelled" (Pascal Case)
- **Priority Values**: "Low", "Medium", "High", "Urgent" (Pascal Case)

### Backend (Existing)
- **Framework**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **API Routes**: `/api/projects/:projectId/tasks`, `/api/projects/:projectId/dashboard`, `/api/auth/*`
- **Status Values**: "pending", "in-progress", "completed", "cancelled" (kebab-case)
- **Priority Values**: "low", "medium", "high", "urgent" (lowercase)
- **Authentication**: JWT tokens
- **Response Format**: `{ data: {...}, meta: {...} }` or `{ data: {...}, pagination: {...} }`

## Key Challenges

1. **Route Structure Mismatch**
   - Frontend: Flat routes (`/tasks`, `/dashboard`)
   - Backend: Project-scoped routes (`/api/projects/:projectId/tasks`)

2. **Data Format Differences**
   - Status: Frontend uses "In Progress", backend uses "in-progress"
   - Priority: Frontend uses "High", backend uses "high"
   - ID field: Frontend uses `id`, backend uses `_id`

3. **Mock Data Removal**
   - All CRUD operations currently use mock data
   - Need to replace with real API calls

4. **Project ID Handling**
   - Backend requires `projectId` for all task operations
   - Frontend doesn't currently handle projects
   - Solution: Store projectId in settings/context, make it required

5. **Authentication Integration**
   - Frontend has mock login/signup
   - Need to integrate with `/api/auth/*` endpoints
   - Token storage: sessionStorage (access), localStorage (refresh)

6. **Dashboard Integration**
   - Frontend calculates stats from mock tasks
   - Backend has dedicated `/api/projects/:projectId/dashboard` endpoint
   - Need to replace calculations with API call

## Implementation Strategy

### Phase 1: API Client Setup
- Create TypeScript API client service
- Handle authentication headers
- Add request/response interceptors
- Implement error handling
- Add token refresh logic

### Phase 2: Data Mapping & Transformation
- Create mapper functions for status (frontend ↔ backend)
- Create mapper functions for priority (frontend ↔ backend)
- Map `_id` to `id` and vice versa
- Handle date formats
- Transform API responses to match frontend types

### Phase 3: AppContext Integration
- Replace mock login/signup with real API calls
- Replace mock task CRUD with real API calls
- Add projectId management
- Add loading and error states
- Implement proper state management

### Phase 4: Route & Project ID Handling
- Update routes to include projectId (or fetch from context)
- Add project selection/configuration in settings
- Update all API calls to include projectId
- Handle missing projectId scenarios

### Phase 5: Component Updates
- Update all pages to use real API data
- Add loading states (skeletons/spinners)
- Add error handling and display
- Update forms to use real API
- Integrate dashboard API endpoint

### Phase 6: Testing & Refinement
- Test all CRUD operations
- Test authentication flow
- Test dashboard data
- Test filtering and pagination
- Fix any mapping/transformation issues

## Technical Decisions

1. **Project ID Storage**: Store in localStorage/sessionStorage, accessible via context
2. **Status/Priority Mapping**: Create utility functions for bidirectional mapping
3. **Error Handling**: Use toast notifications (Sonner) for API errors
4. **Loading States**: Use Skeleton components from UI library
5. **Token Management**: Access token in sessionStorage, refresh token in localStorage

## Dependencies

- Existing backend API (all endpoints working)
- Frontend UI components (already built)
- TypeScript types alignment
- API response format compatibility

