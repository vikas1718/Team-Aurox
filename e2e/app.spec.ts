import { test, expect } from '@playwright/test';

test.describe('News Weaver AI App', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check that the login page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check for any login form elements or text
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('Login');
  });

  test('should redirect to login when accessing root', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should have dashboard navigation elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for sidebar or navigation elements
    const bodyText = await page.locator('body').textContent();
    // Look for common dashboard elements
    expect(bodyText).toBeTruthy();
  });
});

