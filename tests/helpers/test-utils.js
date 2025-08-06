import { expect } from '@playwright/test';

/**
 * Custom test helpers and utilities for QueryNest testing
 */

/**
 * Helper to create a test user session
 * @param {Page} page - Playwright page object
 * @param {Object} userData - User data for login
 * @returns {Promise<Object>} - User session data
 */
export async function createTestUserSession(page, userData = {}) {
  const defaultUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  };

  const user = { ...defaultUser, ...userData };

  // Navigate to login page
  await page.goto('/auth/login');

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', user.email);
  await page.fill('input[type="password"], input[name="password"]', user.password);

  // Submit form
  await page.click('button[type="submit"], button:has-text("Log")');

  // Wait for navigation or response
  await page.waitForLoadState('networkidle');

  return user;
}

/**
 * Helper to create a test question
 * @param {APIRequestContext} request - Playwright request context
 * @param {string} token - Authentication token
 * @param {Object} questionData - Question data
 * @returns {Promise<Object>} - Created question response
 */
export async function createTestQuestion(request, token, questionData = {}) {
  const defaultQuestion = {
    title: 'Test Question Title',
    content: 'This is a test question content',
    tags: ['javascript', 'testing']
  };

  const question = { ...defaultQuestion, ...questionData };

  const response = await request.post('/api/questions', {
    data: question,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response;
}

/**
 * Helper to clean up test data
 * @param {APIRequestContext} request - Playwright request context
 * @param {string} token - Authentication token
 * @param {string} questionId - Question ID to delete
 */
export async function cleanupTestQuestion(request, token, questionId) {
  try {
    await request.delete('/api/questions', {
      data: { questionId },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.log('Cleanup error (may be expected):', error.message);
  }
}

/**
 * Helper to wait for element with custom timeout
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForElement(page, selector, timeout = 10000) {
  await page.waitForSelector(selector, { timeout });
}

/**
 * Helper to check if element exists without failing
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<boolean>} - Whether element exists
 */
export async function elementExists(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to mock API responses for testing
 * @param {Page} page - Playwright page object
 * @param {string} url - URL pattern to mock
 * @param {Object} response - Mock response data
 */
export async function mockApiResponse(page, url, response) {
  await page.route(url, async route => {
    await route.fulfill({
      status: response.status || 200,
      contentType: 'application/json',
      body: JSON.stringify(response.data || {})
    });
  });
}

/**
 * Custom assertion to check API response structure
 * @param {Object} response - API response object
 * @param {Array} requiredFields - Required fields in response
 */
export function expectValidApiResponse(response, requiredFields = []) {
  expect(response).toBeDefined();
  expect(typeof response).toBe('object');
  
  requiredFields.forEach(field => {
    expect(response).toHaveProperty(field);
  });
}

/**
 * Helper to generate random test data
 */
export const testDataGenerator = {
  randomEmail: () => `test-${Date.now()}@example.com`,
  randomUsername: () => `testuser-${Date.now()}`,
  randomTitle: () => `Test Question ${Date.now()}`,
  randomContent: () => `This is test content generated at ${new Date().toISOString()}`,
  randomTag: () => `tag-${Math.random().toString(36).substring(7)}`
};

/**
 * Helper to handle console errors and warnings
 * @param {Page} page - Playwright page object
 * @returns {Array} - Array to store console messages
 */
export function setupConsoleCapture(page) {
  const messages = [];
  
  page.on('console', message => {
    messages.push({
      type: message.type(),
      text: message.text(),
      location: message.location()
    });
  });

  page.on('pageerror', error => {
    messages.push({
      type: 'error',
      text: error.message,
      stack: error.stack
    });
  });

  return messages;
}