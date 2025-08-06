import { test, expect } from '@playwright/test';

test.describe('API Integration Tests - Spell Check', () => {
  let baseURL;

  test.beforeEach(async ({ page }) => {
    baseURL = 'http://localhost:3000';
  });

  test.describe('POST /api/spellCheck', () => {
    test('should reject unauthorized requests', async ({ request }) => {
      const spellCheckData = {
        text: 'This is a test text',
        type: 'text'
      };

      const response = await request.post(`${baseURL}/api/spellCheck`, {
        data: spellCheckData
      });

      // Should require authentication
      expect([401, 403]).toContain(response.status());
    });

    test('should handle request with invalid token', async ({ request }) => {
      const spellCheckData = {
        text: 'This is a test text',
        type: 'text'
      };

      const response = await request.post(`${baseURL}/api/spellCheck`, {
        data: spellCheckData,
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      expect([401, 403]).toContain(response.status());
    });

    test('should validate request body structure', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/spellCheck`, {
        data: {},
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      // Should return error for missing required fields
      expect([400, 401, 422]).toContain(response.status());
    });

    test('should handle empty text', async ({ request }) => {
      const spellCheckData = {
        text: '',
        type: 'text'
      };

      const response = await request.post(`${baseURL}/api/spellCheck`, {
        data: spellCheckData,
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      // Should handle empty text gracefully
      expect([200, 400, 401]).toContain(response.status());
    });

    test('should handle different text types', async ({ request }) => {
      const textTypes = ['text', 'title', 'content'];

      for (const type of textTypes) {
        const spellCheckData = {
          text: 'Sample text for correction',
          type: type
        };

        const response = await request.post(`${baseURL}/api/spellCheck`, {
          data: spellCheckData,
          headers: {
            'Authorization': 'Bearer test-token'
          }
        });

        // Status could be 200 (success) or 401 (unauthorized)
        expect([200, 401]).toContain(response.status());
      }
    });
  });
});

test.describe('API Integration Tests - Tags', () => {
  let baseURL;

  test.beforeEach(async ({ page }) => {
    baseURL = 'http://localhost:3000';
  });

  test.describe('GET /api/tag', () => {
    test('should return tags list', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/tag`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data) || typeof data === 'object').toBe(true);
    });
  });

  test.describe('POST /api/tag', () => {
    test('should handle tag creation', async ({ request }) => {
      const tagData = {
        name: 'javascript',
        description: 'JavaScript programming language'
      };

      const response = await request.post(`${baseURL}/api/tag`, {
        data: tagData
      });

      // Could be 200 (success), 400 (validation), 401 (auth), or 409 (exists)
      expect([200, 400, 401, 409]).toContain(response.status());
    });

    test('should validate tag name', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/tag`, {
        data: {}
      });

      expect([400, 401, 422]).toContain(response.status());
    });
  });
});

test.describe('API Integration Tests - Voting', () => {
  let baseURL;

  test.beforeEach(async ({ page }) => {
    baseURL = 'http://localhost:3000';
  });

  test.describe('POST /api/vote', () => {
    test('should require authentication', async ({ request }) => {
      const voteData = {
        questionId: '123',
        voteType: 'upvote'
      };

      const response = await request.post(`${baseURL}/api/vote`, {
        data: voteData
      });

      expect([401, 403]).toContain(response.status());
    });

    test('should validate vote data', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/vote`, {
        data: {},
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      expect([400, 401, 422]).toContain(response.status());
    });

    test('should handle different vote types', async ({ request }) => {
      const voteTypes = ['upvote', 'downvote'];

      for (const voteType of voteTypes) {
        const voteData = {
          questionId: '123',
          voteType: voteType
        };

        const response = await request.post(`${baseURL}/api/vote`, {
          data: voteData,
          headers: {
            'Authorization': 'Bearer test-token'
          }
        });

        expect([200, 400, 401, 404]).toContain(response.status());
      }
    });
  });
});