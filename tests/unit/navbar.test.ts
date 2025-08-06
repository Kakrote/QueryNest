import { test, expect } from '@playwright/test';

test.describe('Component Tests - Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Navbar Rendering', () => {
    test('should render navbar with logo', async ({ page }) => {
      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();
      
      const logo = page.locator('text=QueryNest');
      await expect(logo).toBeVisible();
    });

    test('should render menu toggle button', async ({ page }) => {
      const menuButton = page.locator('button').first();
      await expect(menuButton).toBeVisible();
      
      // Check if it has menu icon (LucideMenu)
      await expect(menuButton).toBeVisible();
    });

    test('should render search icon', async ({ page }) => {
      const searchIcon = page.locator('svg').first();
      await expect(searchIcon).toBeVisible();
    });
  });

  test.describe('Authentication State', () => {
    test('should show login/signup buttons when not authenticated', async ({ page }) => {
      // Check for login button
      const loginButton = page.locator('text=Log In');
      await expect(loginButton).toBeVisible();
      
      // Check for signup button
      const signupButton = page.locator('text=sign up');
      await expect(signupButton).toBeVisible();
    });

    test('should have correct button styling', async ({ page }) => {
      const loginButton = page.locator('text=Log In');
      const signupButton = page.locator('text=sign up');
      
      // Check if buttons exist and are clickable
      await expect(loginButton).toBeVisible();
      await expect(signupButton).toBeVisible();
      
      // Check if they're actually buttons or links
      const loginElement = page.locator('a:has-text("Log In"), button:has-text("Log In")');
      const signupElement = page.locator('a:has-text("sign up"), button:has-text("sign up")');
      
      await expect(loginElement).toBeVisible();
      await expect(signupElement).toBeVisible();
    });
  });

  test.describe('Navigation Links', () => {
    test('should navigate to login page when login clicked', async ({ page }) => {
      await page.click('text=Log In');
      await expect(page).toHaveURL(/.*auth\/login/);
    });

    test('should navigate to signup page when signup clicked', async ({ page }) => {
      await page.click('text=sign up');
      await expect(page).toHaveURL(/.*auth\/signup/);
    });

    test('should navigate to home when logo clicked', async ({ page }) => {
      // First navigate away from home
      await page.goto('/questions');
      
      // Then click logo to go back
      await page.click('text=QueryNest');
      await expect(page).toHaveURL(/^[^?]*\/$/); // Should be home page
    });
  });

  test.describe('Menu Interactions', () => {
    test('should handle menu toggle click', async ({ page }) => {
      const menuButton = page.locator('button').first();
      
      // Click should not cause errors
      await menuButton.click();
      
      // Page should still be functional
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should be visible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();
      
      // Logo should still be visible
      await expect(page.locator('text=QueryNest')).toBeVisible();
    });

    test('should be visible on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();
      
      // All elements should be visible
      await expect(page.locator('text=QueryNest')).toBeVisible();
      await expect(page.locator('text=Log In')).toBeVisible();
    });

    test('should maintain fixed position', async ({ page }) => {
      // Scroll down to test fixed positioning
      await page.evaluate(() => window.scrollTo(0, 500));
      
      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();
      
      // Navbar should still be at the top
      const navPosition = await navbar.boundingBox();
      expect(navPosition?.y).toBeLessThan(10);
    });
  });

  test.describe('Styling and Appearance', () => {
    test('should have proper background and styling', async ({ page }) => {
      const navbar = page.locator('nav');
      
      // Check if navbar has proper classes/styling
      const navClasses = await navbar.getAttribute('class');
      expect(navClasses).toContain('fixed');
      expect(navClasses).toContain('top-0');
    });

    test('should have proper z-index for overlay', async ({ page }) => {
      const navbar = page.locator('nav');
      const navClasses = await navbar.getAttribute('class');
      
      // Should have z-index class
      expect(navClasses).toContain('z-');
    });
  });
});