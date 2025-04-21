# Learning Management System (LMS) - Project Review

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Course Structure](#3-course-structure)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Backend Requirements](#5-backend-requirements)
6. [Security Considerations](#6-security-considerations)
7. [Recommendations for Backend Implementation](#7-recommendations-for-backend-implementation)

## 1. Architecture Overview

The project follows a modern React-based architecture with a clear separation of concerns:

```
src/pages/classroomShowcase/
├── admin/                 # Admin-specific components
├── components/           # Reusable components
├── pages/               # Main page components
│   ├── Classroom/       # Classroom view
│   ├── Settings/        # Settings management
│   └── components/      # Page-specific components
├── mocks/              # Mock data
├── lecture/            # Lecture-related components
└── courses/            # Course-related components
```

## 2. User Roles & Permissions

The system implements a role-based access control (RBAC) with three main roles:

### User Roles:

1. **Regular User**

   - Can view all FREE courses
   - Can view PRO courses if they have PRO tier
   - Cannot create or modify courses

2. **Instructor**

   - Can view all courses
   - Can create both FREE and PRO courses
   - Can manage their own courses
   - Has access to Settings section

3. **Admin**
   - Has all instructor privileges
   - Additional administrative capabilities
   - Full system access

## 3. Course Structure

The course hierarchy follows a nested structure:

```
Course
├── Sections (Orderable)
│   └── Lectures (Orderable)
```

### Key Features:

- Drag and Drop reordering for both sections and lectures
- Flexible content organization
- Visual hierarchy with clear navigation

## 4. Frontend Implementation

### Main Components:

1. **ClassroomShowcasePage**

   - Main container component
   - Handles user authentication
   - Manages course filtering and display

2. **ClassroomShowcaseContent**

   - Navigation management
   - Role-based menu items
   - Content routing

3. **DraggableCourseCard**
   - Course display component
   - Drag and drop functionality
   - Course management actions (edit, delete)

### Key Features:

- Responsive design with mobile support
- Role-based navigation
- Dynamic content loading
- Interactive course management

## 5. Backend Requirements

### Data Models Needed:

1. **User Model**

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "INSTRUCTOR" | "ADMIN";
  tier: "FREE" | "PRO";
  createdAt: Date;
  updatedAt: Date;
}
```

2. **Course Model**

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  published: boolean;
  tier: "FREE" | "PRO";
  instructorId: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}
```

3. **Section Model**

```typescript
interface Section {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lectures: Lecture[];
  createdAt: Date;
  updatedAt: Date;
}
```

4. **Lecture Model**

```typescript
interface Lecture {
  id: string;
  title: string;
  content: string;
  order: number;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints Needed:

1. **Course Management**

```
GET    /api/courses           - List all courses (filtered by user role/tier)
POST   /api/courses           - Create new course (instructor only)
GET    /api/courses/:id       - Get course details
PUT    /api/courses/:id       - Update course (instructor only)
DELETE /api/courses/:id       - Delete course (instructor only)
```

2. **Section Management**

```
GET    /api/courses/:id/sections     - List course sections
POST   /api/courses/:id/sections     - Create section
PUT    /api/sections/:id             - Update section
DELETE /api/sections/:id             - Delete section
PUT    /api/sections/reorder         - Reorder sections
```

3. **Lecture Management**

```
GET    /api/sections/:id/lectures    - List section lectures
POST   /api/sections/:id/lectures    - Create lecture
PUT    /api/lectures/:id             - Update lecture
DELETE /api/lectures/:id             - Delete lecture
PUT    /api/lectures/reorder         - Reorder lectures
```

## 6. Security Considerations

1. **Authentication**

   - JWT-based authentication
   - Role-based access control
   - Session management

2. **Authorization**

   - Course access based on user tier
   - Content modification based on user role
   - Resource ownership validation

3. **Data Protection**
   - Input validation
   - XSS prevention
   - CSRF protection

## 7. Recommendations for Backend Implementation

1. **Database**

   - Use PostgreSQL for relational data
   - Implement proper indexing for performance
   - Use transactions for reordering operations

2. **API Design**

   - RESTful endpoints
   - Proper error handling
   - Rate limiting
   - Caching strategy

3. **Performance**

   - Implement pagination
   - Use lazy loading for content
   - Optimize database queries
   - Implement proper indexing

4. **Scalability**
   - Microservices architecture
   - Load balancing
   - Caching layer
   - CDN for static content

---

This document provides a comprehensive overview of the LMS system's requirements and architecture. The backend implementation should focus on security, scalability, and performance while maintaining the flexibility needed for the drag-and-drop functionality and role-based access control.
