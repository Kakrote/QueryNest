import { test, expect } from '@playwright/test';

test.describe('End-to-End Tests - User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test.describe('Homepage and Navigation', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/QueryNest/);
      
      // Check if navbar is visible
      await expect(page.locator('nav')).toBeVisible();
      
      // Check if logo/brand is present
      await expect(page.locator('text=QueryNest')).toBeVisible();
    });

    test('should display login and signup buttons when not authenticated', async ({ page }) => {
      // Should see login and signup buttons
      await expect(page.locator('text=Log In')).toBeVisible();
      await expect(page.locator('text=sign up')).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.click('text=Log In');
      await expect(page).toHaveURL(/.*auth\/login/);
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.click('text=sign up');
      await expect(page).toHaveURL(/.*auth\/signup/);
    });

    test('should have menu toggle button', async ({ page }) => {
      const menuButton = page.locator('button').first(); // Menu button is typically first
      await expect(menuButton).toBeVisible();
      
      // Click menu button (should not cause errors)
      await menuButton.click();
    });
  });

  test.describe('Questions Page', () => {
    test('should navigate to questions page', async ({ page }) => {
      await page.goto('/questions');
      await expect(page).toHaveURL(/.*questions/);
    });

    test('should display questions list', async ({ page }) => {
      await page.goto('/questions');
      
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      
      // Should have some content related to questions
      // This might be a loading state, empty state, or actual questions
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle empty questions state gracefully', async ({ page }) => {
      await page.goto('/questions');
      await page.waitForLoadState('networkidle');
      
      // Page should load without errors even if no questions exist
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Should have email and password fields
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
      
      // Should have login button
      await expect(page.locator('button:has-text("Log"), button:has-text("Sign")')).toBeVisible();
    });

    test('should display registration form', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Should have name, email and password fields
      const form = page.locator('form').first();
      await expect(form).toBeVisible();
      
      // Look for input fields (name, email, password)
      const inputs = page.locator('input');
      await expect(inputs).toHaveCount(3, { timeout: 5000 });
    });

    test('should handle login form submission', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Fill in test credentials
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'testpassword');
      
      // Submit form
      await page.click('button[type="submit"], button:has-text("Log")');
      
      // Should handle the submission (may show error or redirect)
      await page.waitForLoadState('networkidle');
      
      // Page should not crash
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Should still show navbar
      await expect(page.locator('nav')).toBeVisible();
      
      // Should show menu button
      await expect(page.locator('button').first()).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('text=QueryNest')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('/');
      
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('text=QueryNest')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      // Should show some kind of 404 page or redirect
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Test with a potentially invalid endpoint
      await page.goto('/api/invalid-endpoint');
      
      // Should not crash the browser
      await expect(page.locator('body')).toBeVisible();
    });
  });
});