# QueryNest - GitHub Copilot Instructions

---
applyTo: "**"
---

## Project Overview

**QueryNest** is a full-stack Q&A web application built with Next.js 15, TypeScript, Prisma ORM, and Tailwind CSS. It allows users to ask questions, provide answers, comment, vote, and manage authentication in a Stack Overflow-like interface.

### Key Technologies
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **State Management:** Redux Toolkit with Redux Persist
- **Authentication:** JWT with bcrypt
- **Testing:** Playwright (unit, integration, e2e)
- **Rich Text Editor:** Tiptap with security sanitization
- **Security:** XSS protection, input sanitization, content security policies

## Architecture & Code Organization

### Directory Structure
```
app/                    # Next.js App Router pages and API routes
├── api/               # API route handlers
├── questions/         # Question-related pages
├── auth/             # Authentication pages
└── [other-pages]/    # Other application pages

components/            # Reusable React components
controllers/          # Business logic controllers
lib/                  # Library configurations (Prisma, etc.)
middleware/           # Custom middleware
prisma/               # Database schema and migrations
redux/                # Redux store and slices
utils/                # Utility functions
tests/                # Test files (unit, integration, e2e)
```

### Database Schema
The application uses the following main entities:
- **User:** User accounts with authentication
- **Question:** User-submitted questions with tagging
- **Answer:** Responses to questions
- **Comment:** Comments on questions and answers
- **Vote:** Voting system for questions and answers
- **Tag:** Categorization system

## Coding Guidelines

### TypeScript Standards
- Use strict TypeScript configuration
- Define proper interfaces and types for all data structures
- Use generic types where appropriate
- Leverage TypeScript utility types (Partial, Pick, Omit, etc.)
- Avoid `any` type unless absolutely necessary

### React/Next.js Patterns
- Use React Server Components by default
- Use Client Components only when necessary (user interactions, hooks)
- Implement proper error boundaries
- Use Next.js App Router conventions
- Follow React hooks rules and best practices
- Use proper key props for lists

### API Development
- Follow RESTful conventions for API routes
- Implement proper HTTP status codes
- Use consistent error response formats
- Validate all inputs using server-side validation
- Implement proper authentication middleware
- Use Prisma for database operations

### State Management
- Use Redux Toolkit for complex state
- Keep state minimal and normalized
- Use React local state for component-specific data
- Implement proper error handling in Redux slices

### Security Practices
- **Input Sanitization:** All user inputs must be sanitized using the `sanitizeHtml` utility
- **XSS Prevention:** Use DOMPurify for HTML content sanitization
- **SQL Injection Prevention:** Use Prisma ORM parameterized queries
- **Authentication:** Implement proper JWT token validation
- **Content Security Policy:** Follow CSP headers configuration
- **CSRF Protection:** Implement CSRF tokens for state-changing operations

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use consistent spacing and color schemes
- Implement dark/light mode support where applicable
- Use CSS variables for theme customization

### Testing Strategy
- Write unit tests for utility functions
- Write integration tests for API routes
- Write e2e tests for critical user flows
- Use Playwright test framework
- Maintain test coverage above 80%
- Follow AAA pattern (Arrange, Act, Assert)

### Performance Optimization
- Use Next.js Image component for images
- Implement proper code splitting
- Use React.memo for expensive components
- Optimize database queries with proper indexing
- Implement caching strategies for API responses

## Development Workflow

### File Naming Conventions
- Use PascalCase for React components (`UserProfile.tsx`)
- Use camelCase for utility functions (`sanitizeHtml.ts`)
- Use kebab-case for page routes (`ask-question/`)
- Use lowercase for configuration files

### Component Structure
```typescript
// Component template
interface ComponentProps {
  // Define props with proper types
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  // Event handlers
  // Render logic
  return (
    // JSX with proper accessibility
  );
}
```

### API Route Structure
```typescript
// API route template
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/utils/serverValidation';

export async function GET(request: NextRequest) {
  try {
    // Validate inputs
    // Business logic
    // Return proper response
  } catch (error) {
    // Error handling
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Database Operations
- Always use Prisma for database operations
- Implement proper error handling
- Use transactions for related operations
- Follow database best practices for queries

### Error Handling
- Use try-catch blocks for async operations
- Implement user-friendly error messages
- Log errors for debugging
- Use proper HTTP status codes
- Handle edge cases gracefully

## Security Requirements

### Input Validation
- Validate all user inputs on both client and server
- Use schema validation for complex data structures
- Sanitize HTML content before storage and display
- Implement rate limiting for API endpoints

### Authentication & Authorization
- Use JWT tokens with proper expiration
- Implement refresh token mechanism
- Validate user permissions for protected routes
- Use secure password hashing (bcrypt)

### Content Security
- Sanitize all user-generated content
- Implement XSS protection
- Use HTTPS in production
- Validate file uploads properly

## Testing Guidelines

### Unit Testing
- Test utility functions thoroughly
- Test component logic separately from UI
- Mock external dependencies
- Use descriptive test names

### Integration Testing
- Test API routes with realistic data
- Test database operations
- Test authentication flows
- Test error scenarios

### E2E Testing
- Test critical user journeys
- Test cross-browser compatibility
- Test responsive design
- Test accessibility features

## Documentation Standards

### Code Comments
- Document complex business logic
- Explain non-obvious code decisions
- Document API endpoints properly
- Include JSDoc comments for public functions

### README Updates
- Keep installation instructions current
- Document environment variables
- Include deployment instructions
- Maintain feature documentation

## Performance Guidelines

### Frontend Performance
- Optimize bundle size
- Use lazy loading for routes
- Implement proper caching
- Optimize images and assets

### Backend Performance
- Optimize database queries
- Implement proper indexing
- Use connection pooling
- Cache frequently accessed data

### Monitoring
- Implement error tracking
- Monitor performance metrics
- Log important user actions
- Set up health checks

## Migration Notes

The project is currently migrating from JavaScript to TypeScript:
- Convert `.js/.jsx` files to `.ts/.tsx`
- Add proper type definitions
- Update imports and exports
- Maintain backward compatibility during transition
- Test thoroughly after conversion

## Common Patterns

### Async Data Fetching
```typescript
// Use React Server Components for data fetching
async function DataComponent() {
  const data = await fetchData();
  return <div>{/* render data */}</div>;
}
```

### Form Handling
```typescript
// Use react-hook-form with validation
import { useForm } from 'react-hook-form';

interface FormData {
  // Define form fields
}

export default function FormComponent() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  // Form logic
}
```

### Error Boundaries
```typescript
// Implement error boundaries for robust error handling
class ErrorBoundary extends React.Component {
  // Error boundary implementation
}
```

## Development Environment

### Required Tools
- Node.js 18+
- npm/yarn
- PostgreSQL
- VS Code with recommended extensions
- Git

### Environment Variables
```bash
DATABASE_URL=          # PostgreSQL connection string
JWT_SECRET=           # JWT signing secret
NEXT_PUBLIC_APP_URL=  # Application URL
```

### Development Commands
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run test          # Run all tests
npm run test:unit     # Run unit tests
npm run test:e2e      # Run e2e tests
npm run lint          # Run ESLint
```

---

**Note:** Always prioritize security, performance, and user experience when implementing features. Follow these guidelines consistently to maintain code quality and project standards.
