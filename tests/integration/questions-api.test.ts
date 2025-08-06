import { test, expect } from '@playwright/test';

test.describe('API Integration Tests - Questions', () => {
  let baseURL;

  test.beforeEach(async ({ page }) => {
    baseURL = 'http://localhost:3000';
  });

  test.describe('GET /api/questions', () => {
    test('should return questions list with default pagination', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/questions`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('questions');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('totalPages');
      expect(Array.isArray(data.questions)).toBe(true);
    });

    test('should handle pagination parameters', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/questions?page=1&limit=5`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.page).toBe(1);
      expect(data.questions.length).toBeLessThanOrEqual(5);
    });

    test('should handle sort parameters', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/questions?sort=latest`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('questions');
    });

    test('should handle invalid pagination gracefully', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/questions?page=-1&limit=0`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      // Should use default values for invalid parameters
      expect(data.page).toBeGreaterThan(0);
    });
  });

  test.describe('POST /api/questions', () => {
    test('should reject unauthorized request', async ({ request }) => {
      const questionData = {
        title: 'Test Question',
        content: 'This is a test question content',
        tags: ['javascript', 'testing']
      };

      const response = await request.post(`${baseURL}/api/questions`, {
        data: questionData
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.message).toContain('unauthorized');
    });

    test('should validate required fields', async ({ request }) => {
      // This test would need proper authentication setup
      // For now, we test the validation at the API level
      const response = await request.post(`${baseURL}/api/questions`, {
        data: {},
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      // Should fail due to missing required fields or invalid auth
      expect([400, 401, 500]).toContain(response.status());
    });
  });

  test.describe('DELETE /api/questions', () => {
    test('should reject unauthorized delete request', async ({ request }) => {
      const response = await request.delete(`${baseURL}/api/questions`, {
        data: { questionId: '123' }
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.message).toContain('Unauthorized');
    });

    test('should validate questionId parameter', async ({ request }) => {
      const response = await request.delete(`${baseURL}/api/questions`, {
        data: {},
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      // Should fail due to missing questionId or invalid auth
      expect([400, 401]).toContain(response.status());
    });
  });
});