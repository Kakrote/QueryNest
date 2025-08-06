import { test, expect } from '@playwright/test';

test.describe('API Integration Tests - Authentication', () => {
  let baseURL;

  test.beforeEach(async ({ page }) => {
    baseURL = 'http://localhost:3000';
  });

  test.describe('POST /api/auth/login', () => {
    test('should handle login request structure', async ({ request }) => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      const response = await request.post(`${baseURL}/api/auth/login`, {
        data: loginData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Response should be JSON regardless of success/failure
      const data = await response.json();
      expect(data).toHaveProperty('message');
      
      // Should return appropriate status (200 for success, 4xx for invalid credentials)
      expect([200, 400, 401, 404]).toContain(response.status());
    });

    test('should reject empty credentials', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/login`, {
        data: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect([400, 401]).toContain(response.status());
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
    });

    test('should handle malformed JSON', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/login`, {
        data: 'invalid-json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect([400, 500]).toContain(response.status());
    });

    test('should return expected response structure for valid format', async ({ request }) => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const response = await request.post(`${baseURL}/api/auth/login`, {
        data: loginData
      });

      const data = await response.json();
      expect(data).toHaveProperty('message');
      
      // If successful, should have token and user
      if (response.status() === 200) {
        expect(data).toHaveProperty('token');
        expect(data).toHaveProperty('user');
      }
    });
  });

  test.describe('POST /api/auth/register', () => {
    test('should handle registration request structure', async ({ request }) => {
      const registerData = {
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request.post(`${baseURL}/api/auth/register`, {
        data: registerData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Should return JSON response
      const data = await response.json();
      expect(data).toHaveProperty('message');
      
      // Status could be 200 (success), 400 (validation error), or 409 (user exists)
      expect([200, 400, 409, 500]).toContain(response.status());
    });

    test('should validate email format', async ({ request }) => {
      const registerData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request.post(`${baseURL}/api/auth/register`, {
        data: registerData
      });

      // Should fail validation
      expect([400, 422]).toContain(response.status());
    });

    test('should require all fields', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/register`, {
        data: {
          email: 'test@example.com'
          // Missing name and password
        }
      });

      expect([400, 422]).toContain(response.status());
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
    });
  });
});