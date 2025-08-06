# QueryNest Test Suite

This directory contains a comprehensive Playwright-based test suite for the QueryNest application, covering unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/                   # Unit tests for individual components and utilities
│   ├── slugify.test.js    # Tests for the slugify utility function
│   ├── correctText.test.js # Tests for the text correction utility
│   └── navbar.test.js     # Tests for the Navbar component
├── integration/           # Integration tests for API endpoints
│   ├── auth-api.test.js   # Authentication API tests
│   ├── questions-api.test.js # Questions API tests
│   └── other-apis.test.js # Tests for spell check, tags, voting APIs
├── e2e/                   # End-to-end tests for complete user workflows
│   ├── user-journey.test.js # Basic user navigation and interaction tests
│   └── complete-user-flow.test.js # Comprehensive user flow scenarios
└── helpers/               # Test utilities and helper functions
    └── test-utils.js      # Shared testing utilities
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- QueryNest application set up locally

### Installation

The test dependencies should already be installed. If not, run:

```bash
npm install
```

### Running Tests

#### All Tests
```bash
npm test
```

#### Unit Tests Only
```bash
npm run test:unit
```

#### Integration Tests Only
```bash
npm run test:integration
```

#### End-to-End Tests Only
```bash
npm run test:e2e
```

#### Interactive Mode (Test UI)
```bash
npm run test:ui
```

#### Debug Mode
```bash
npm run test:debug
```

#### View Test Report
```bash
npm run test:report
```

## Test Categories

### Unit Tests

Unit tests focus on individual functions and components in isolation:

- **Utility Functions**: Tests for `slugify`, `correctText`, and other utility functions
- **Component Tests**: Tests for React components like Navbar
- **Pure Function Logic**: Tests that don't require external dependencies

### Integration Tests

Integration tests verify API endpoints and their behavior:

- **Authentication APIs**: Login, registration, token validation
- **Questions APIs**: CRUD operations for questions
- **Voting APIs**: Upvote/downvote functionality
- **Tag APIs**: Tag creation and management
- **Spell Check APIs**: Text correction services

### End-to-End Tests

E2E tests simulate real user interactions:

- **User Registration and Login**: Complete authentication flows
- **Question Management**: Creating, viewing, editing questions
- **Navigation**: Page-to-page navigation and routing
- **Responsive Design**: Testing across different viewport sizes
- **Error Handling**: How the app handles various error scenarios

## Test Configuration

Tests are configured via `playwright.config.js` in the root directory. Key settings:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, and mobile viewports
- **Web Server**: Automatically starts the development server
- **Parallel Execution**: Tests run in parallel for faster execution
- **Retry Logic**: Automatic retries on CI environments

## Test Helpers

The `tests/helpers/test-utils.js` file provides useful utilities:

- `createTestUserSession()` - Helper for user authentication in tests
- `createTestQuestion()` - Helper for creating test questions
- `mockApiResponse()` - Helper for mocking API responses
- `testDataGenerator` - Generates random test data
- `setupConsoleCapture()` - Captures console messages and errors

## Writing New Tests

### Unit Test Example

```javascript
import { test, expect } from '@playwright/test';
import { myFunction } from '../../utils/myFunction.js';

test.describe('My Function', () => {
  test('should handle basic input', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Test Example

```javascript
import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('should return expected response', async ({ request }) => {
    const response = await request.get('/api/endpoint');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('expectedField');
  });
});
```

### E2E Test Example

```javascript
import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test('should complete user action', async ({ page }) => {
    await page.goto('/');
    await page.click('button');
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

## Test Data Management

- Use the `testDataGenerator` helper for creating unique test data
- Clean up test data after tests when possible
- Use descriptive names for test data to aid debugging

## CI/CD Integration

Tests are configured to run in CI environments with:

- Headless browser execution
- Retry logic for flaky tests
- HTML reports for test results
- Screenshot capture on failures

## Debugging Tests

### Debug Individual Tests
```bash
npx playwright test --debug tests/path/to/test.js
```

### Run Tests with UI
```bash
npx playwright test --ui
```

### View Traces
```bash
npx playwright show-trace trace.zip
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Clean up any test data created during tests
3. **Descriptive Names**: Use clear, descriptive test and describe block names
4. **Assertions**: Use specific assertions that clearly indicate what is being tested
5. **Error Handling**: Test both success and error scenarios
6. **Performance**: Keep tests focused and avoid unnecessary delays

## Troubleshooting

### Common Issues

1. **Browser Download Failures**: Run `npx playwright install` to download browsers
2. **Port Conflicts**: Ensure port 3000 is available for the test server
3. **Database Issues**: Ensure test database is properly configured
4. **Authentication**: Some tests may require valid test user credentials

### Getting Help

- Check the [Playwright documentation](https://playwright.dev/docs/intro)
- Review test output and error messages
- Use debug mode to step through failing tests
- Check the test report for detailed failure information

## Contributing

When adding new features to QueryNest:

1. Add corresponding unit tests for new utility functions
2. Add integration tests for new API endpoints
3. Add E2E tests for new user-facing features
4. Update this documentation if adding new test patterns or helpers