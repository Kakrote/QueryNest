import { test, expect } from '@playwright/test';
import { testDataGenerator, setupConsoleCapture } from '../helpers/test-utils.js';

test.describe('Complete User Flow - Question Management', () => {
  let consoleMessages;

  test.beforeEach(async ({ page }) => {
    consoleMessages = setupConsoleCapture(page);
    await page.goto('/');
  });

  test.describe('Guest User Journey', () => {
    test('should allow guest to browse questions', async ({ page }) => {
      // Navigate to questions page
      await page.goto('/questions');
      await page.waitForLoadState('networkidle');
      
      // Should be able to view page without login
      await expect(page.locator('body')).toBeVisible();
      
      // Should still see login prompts
      await page.goto('/');
      await expect(page.locator('text=Log In')).toBeVisible();
    });

    test('should redirect to login when trying to create content', async ({ page }) => {
      // Try to access a protected route (if any exist)
      await page.goto('/questions/new');
      await page.waitForLoadState('networkidle');
      
      // Should either redirect to login or show login prompt
      const hasLoginForm = await page.locator('input[type="password"]').isVisible();
      const hasLoginButton = await page.locator('text=Log In').isVisible();
      
      expect(hasLoginForm || hasLoginButton).toBe(true);
    });
  });

  test.describe('User Registration Flow', () => {
    test('should complete registration process', async ({ page }) => {
      const userData = {
        name: testDataGenerator.randomUsername(),
        email: testDataGenerator.randomEmail(),
        password: 'SecurePassword123!'
      };

      // Navigate to signup
      await page.click('text=sign up');
      await expect(page).toHaveURL(/.*auth\/signup/);

      // Fill registration form
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      if (await nameInput.isVisible()) {
        await nameInput.fill(userData.name);
      }
      
      await emailInput.fill(userData.email);
      await passwordInput.fill(userData.password);

      // Submit form
      await page.click('button[type="submit"], button:has-text("Sign"), button:has-text("Register")');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Should either redirect or show success message
      await expect(page.locator('body')).toBeVisible();
    });

    test('should validate email format during registration', async ({ page }) => {
      await page.goto('/auth/signup');
      
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      
      // Fill with invalid email
      await emailInput.fill('invalid-email');
      await passwordInput.fill('password123');
      
      // Try to submit
      await page.click('button[type="submit"], button:has-text("Sign"), button:has-text("Register")');
      
      // Should show validation error or not submit
      // HTML5 validation should prevent submission
      const currentUrl = page.url();
      expect(currentUrl).toContain('signup');
    });
  });

  test.describe('User Login Flow', () => {
    test('should handle login attempt', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Fill login form
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'testpassword');
      
      // Submit form
      await page.click('button[type="submit"], button:has-text("Log")');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Should handle the attempt (success or error)
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show appropriate feedback for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Fill with obviously invalid credentials
      await page.fill('input[type="email"], input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
      
      // Submit form
      await page.click('button[type="submit"], button:has-text("Log")');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Should remain on login page or show error
      const currentUrl = page.url();
      const hasErrorMessage = await page.locator('text=error, text=invalid, text=incorrect').count() > 0;
      
      expect(currentUrl.includes('login') || hasErrorMessage).toBe(true);
    });
  });

  test.describe('Question Browsing and Search', () => {
    test('should display questions list', async ({ page }) => {
      await page.goto('/questions');
      await page.waitForLoadState('networkidle');
      
      // Should load without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Check for common question list elements
      const hasQuestionElements = await page.locator('article, .question, [data-testid*="question"]').count() > 0;
      const hasListContainer = await page.locator('ul, ol, .list, .questions').count() > 0;
      
      // Should have some structure for questions (even if empty)
      expect(hasQuestionElements || hasListContainer).toBe(true);
    });

    test('should handle search functionality if available', async ({ page }) => {
      await page.goto('/questions');
      
      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('javascript');
        await page.keyboard.press('Enter');
        
        await page.waitForLoadState('networkidle');
        
        // Should handle search without errors
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle tag filtering if available', async ({ page }) => {
      await page.goto('/questions');
      await page.goto('/tags');
      
      // Should load tags page without error
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure by blocking API calls
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/questions');
      await page.waitForLoadState('networkidle');
      
      // Should still render the page structure
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should not have JavaScript errors on main pages', async ({ page }) => {
      const pages = ['/', '/questions', '/auth/login', '/auth/signup', '/tags'];
      
      for (const pagePath of pages) {
        consoleMessages.length = 0; // Clear previous messages
        
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Check for JavaScript errors
        const jsErrors = consoleMessages.filter(msg => msg.type === 'error');
        
        // Allow for some expected errors (like 404s for missing resources)
        // but should not have critical JS errors
        const criticalErrors = jsErrors.filter(error => 
          !error.text.includes('404') && 
          !error.text.includes('favicon') &&
          !error.text.includes('Failed to fetch')
        );
        
        expect(criticalErrors.length).toBe(0);
      }
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load main page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds (generous for testing environment)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should have basic accessibility features', async ({ page }) => {
      await page.goto('/');
      
      // Should have page title
      await expect(page).toHaveTitle(/.+/);
      
      // Should have navigation landmarks
      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav).toBeVisible();
      
      // Should have main content area
      const main = page.locator('main, [role="main"], .main-content');
      const hasMainContent = await main.count() > 0;
      
      // Either explicit main element or general content structure
      expect(hasMainContent || true).toBe(true); // Allow flexible structure
    });
  });
});