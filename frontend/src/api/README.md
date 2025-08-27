# Frontend API Documentation

This document provides comprehensive documentation for all API integrations in the frontend application.

## Overview

The frontend application uses several API layers:
- **AdminAPI**: For authenticated admin operations
- **PublicAPI**: For public, unauthenticated operations
- **Firebase Auth**: For authentication
- **Custom endpoints**: For specific functionality

## Authentication

### Firebase Authentication
- **Provider**: Firebase Auth
- **Configuration**: `frontend/src/api/firebaseConfig.ts`
- **Context**: `frontend/src/context/AuthContext.tsx`

### Admin Authentication Flow
1. User signs in with Firebase
2. Frontend gets ID token
3. Token sent to backend for admin validation
4. Backend returns admin user data
5. Frontend stores admin user in context

## API Classes

### AdminAPI

**Location**: `frontend/src/api/adminAPI.ts`

**Purpose**: Handles all authenticated admin operations

**Authentication**: Requires Firebase ID token in Authorization header

**Base URL**: Configured via `buildApiUrl()` function

#### Methods

##### Projects
```typescript
// List all projects
AdminAPI.projects.list(): Promise<Project[]>

// Get single project
AdminAPI.projects.get(id: number): Promise<Project>

// Create new project
AdminAPI.projects.create(data: Partial<Project>): Promise<Project>

// Update project
AdminAPI.projects.update(id: number, data: Partial<Project>): Promise<Project>

// Delete project
AdminAPI.projects.delete(id: number): Promise<void>
```

##### Skills
```typescript
// List all skills
AdminAPI.skills.list(): Promise<Skill[]>

// Create new skill
AdminAPI.skills.create(data: Partial<Skill>): Promise<Skill>

// Update skill
AdminAPI.skills.update(id: number, data: Partial<Skill>): Promise<Skill>

// Delete skill
AdminAPI.skills.delete(id: number): Promise<void>
```

##### Experience
```typescript
// List all experience entries
AdminAPI.experience.list(): Promise<Experience[]>

// Create new experience
AdminAPI.experience.create(data: Partial<Experience>): Promise<Experience>

// Update experience
AdminAPI.experience.update(id: number, data: Partial<Experience>): Promise<Experience>

// Delete experience
AdminAPI.experience.delete(id: number): Promise<void>
```

##### Education
```typescript
// List all education entries
AdminAPI.education.list(): Promise<Education[]>

// Create new education
AdminAPI.education.create(data: Partial<Education>): Promise<Education>

// Update education
AdminAPI.education.update(id: number, data: Partial<Education>): Promise<Education>

// Delete education
AdminAPI.education.delete(id: number): Promise<void>
```

##### Testimonials
```typescript
// List all testimonials
AdminAPI.testimonials.list(): Promise<Testimonial[]>

// Create new testimonial
AdminAPI.testimonials.create(data: Partial<Testimonial>): Promise<Testimonial>

// Update testimonial
AdminAPI.testimonials.update(id: number, data: Partial<Testimonial>): Promise<Testimonial>

// Delete testimonial
AdminAPI.testimonials.delete(id: number): Promise<void>
```

##### Services
```typescript
// List all services
AdminAPI.services.list(): Promise<Service[]>

// Create new service
AdminAPI.services.create(data: Partial<Service>): Promise<Service>

// Update service
AdminAPI.services.update(id: number, data: Partial<Service>): Promise<Service>

// Delete service
AdminAPI.services.delete(id: number): Promise<void>
```

##### Admin Users
```typescript
// List all admin users
AdminAPI.adminUsers.list(): Promise<AdminUser[]>

// Delete admin user
AdminAPI.adminUsers.delete(id: number): Promise<void>
```

##### Admin Invitations
```typescript
// List all invitations
AdminAPI.list<AdminInvitation>('admin-invitations'): Promise<AdminInvitation[]>

// Create invitation
AdminAPI.create('admin-invitations', data): Promise<AdminInvitation>

// Update invitation
AdminAPI.patch('admin-invitations', id, data): Promise<AdminInvitation>

// Delete invitation
AdminAPI.delete('admin-invitations', id): Promise<void>
```

##### Settings
```typescript
// List all settings
AdminAPI.settings.list(): Promise<Setting[]>

// Create new setting
AdminAPI.settings.create(data: Partial<Setting>): Promise<Setting>

// Update setting
AdminAPI.settings.update(id: number, data: Partial<Setting>): Promise<Setting>
```

##### Analytics
```typescript
// Get analytics data
AdminAPI.getAnalytics(): Promise<AnalyticsData>
```

##### Contacts/Messages
```typescript
// List all contacts
AdminAPI.contacts.list(): Promise<Contact[]>
```

### PublicAPI

**Location**: `frontend/src/api/publicAPI.ts`

**Purpose**: Handles public, unauthenticated operations

**Authentication**: None required

**Base URL**: Configured via `buildApiUrl()` function

#### Methods

##### Projects
```typescript
// List all public projects
PublicAPI.projects.list(): Promise<PublicProject[]>
```

##### Skills
```typescript
// List all public skills
PublicAPI.skills.list(): Promise<PublicSkill[]>
```

##### Experience
```typescript
// List all public experience entries
PublicAPI.experience.list(): Promise<PublicExperience[]>
```

##### Education
```typescript
// List all public education entries
PublicAPI.education.list(): Promise<PublicEducation[]>
```

##### About
```typescript
// List all public about information
PublicAPI.about.list(): Promise<PublicAbout[]>
```

##### Testimonials
```typescript
// List all public testimonials
PublicAPI.testimonials.list(): Promise<PublicTestimonial[]>
```

##### Social Links
```typescript
// List all public social links
PublicAPI.socialLinks.list(): Promise<PublicSocialLink[]>
```

##### Settings
```typescript
// List all public settings
PublicAPI.settings.list(): Promise<PublicSetting[]>
```

##### Services
```typescript
// List all public services
PublicAPI.services.list(): Promise<PublicService[]>
```

##### Contact Form
```typescript
// Submit contact form
PublicAPI.contact.create(data: ContactFormData): Promise<{ message: string }>
```

### AuthFetch

**Location**: `frontend/src/api/authFetch.ts`

**Purpose**: Utility for making authenticated API requests

**Features**:
- Automatically includes Firebase ID token
- Handles token refresh
- Provides consistent error handling

**Usage**:
```typescript
import { authFetch } from '@/api/authFetch';
import { buildApiUrl } from '@/api/config';

// GET request
const response = await authFetch(buildApiUrl('endpoint/'));

// POST request
const response = await authFetch(buildApiUrl('endpoint/'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

## Error Handling

### Error Types
All errors are handled through the centralized error system in `frontend/src/types/errors.ts`

### Error Logging
All API errors are logged using the production-safe logger in `frontend/src/lib/logger.ts`

### Error Boundaries
React error boundaries catch and handle component errors gracefully

## Rate Limiting

### Implementation
Rate limiting is implemented using the `RateLimiter` class from `frontend/src/lib/security.ts`

### Limits
- **Login attempts**: 5 per 5 minutes
- **Signup attempts**: 3 per 5 minutes
- **Contact form**: 3 per minute
- **Settings updates**: 5 per minute

## Security

### Input Validation
All user inputs are validated and sanitized using functions from `frontend/src/lib/security.ts`

### Authentication
- Firebase ID tokens for authentication
- Automatic token refresh
- Secure token storage

### CSRF Protection
- Tokens included in all authenticated requests
- Backend validates token authenticity

## Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Base URL for API endpoints
- `NODE_ENV`: Environment (development/production)

### API Base URL
Configured in `frontend/src/api/config.ts` using the `buildApiUrl()` function

## Best Practices

### Error Handling
1. Always use try-catch blocks around API calls
2. Log errors with context using the logger
3. Show user-friendly error messages
4. Use error boundaries for component errors

### Authentication
1. Check authentication state before making requests
2. Handle token expiration gracefully
3. Refresh tokens when needed
4. Clear auth state on logout

### Rate Limiting
1. Implement rate limiting for user actions
2. Show clear messages when limits are exceeded
3. Provide retry mechanisms where appropriate

### Input Validation
1. Validate all user inputs on the frontend
2. Sanitize data before sending to API
3. Show validation errors immediately
4. Use consistent error message formats

## Troubleshooting

### Common Issues

#### Authentication Errors
- Check if user is logged in
- Verify token is valid and not expired
- Ensure proper error handling in catch blocks

#### API Errors
- Check network connectivity
- Verify API endpoint URLs
- Check backend logs for detailed errors
- Use browser dev tools to inspect requests

#### Rate Limiting
- Check rate limiter configuration
- Verify user action frequency
- Implement proper retry logic

### Debug Tools
- Browser developer tools
- Network tab for API requests
- Console for error messages
- Local storage for auth state
- Logger utility for structured logging

