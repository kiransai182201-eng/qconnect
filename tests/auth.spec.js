import { test, expect } from '@playwright/test';

test.describe('Authentication & Shop Onboarding Flow', () => {
  
  test('should show validation error with invalid email login credentials', async ({ page }) => {
    await page.goto('/login?mock=true');
    
    // Attempt email login with invalid credentials
    await page.fill('#login-email', 'wrong@cafe.com');
    await page.fill('#login-password', 'wrongpassword');
    await page.click('button:has-text("Sign In")');

    // Verify error alert is displayed
    const errorText = page.locator('text=Invalid login credentials');
    await expect(errorText).toBeVisible();
  });

  test('should handle Landing Page -> Login -> Shop Details -> No. of Tables -> Dashboard flow', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/?mock=true');
    
    // 2. Click CTA to go to login (since not logged in)
    await page.click('text=Get Started Free');
    await page.waitForURL(/\/login/);
    
    // 3. Authenticate with Google OAuth (triggers mock user with no existing shop)
    await page.click('text=Continue with Google');
    
    // 4. Verify redirect to Shop Details setup (since new user has no shop)
    await page.waitForURL(/\/shop-setup/);
    
    // 5. Fill Shop Details and Table count
    await page.fill('#shop-name-input', 'Metropolitan Cafe');
    await page.fill('#owner-name-input', 'Jane Miller');
    await page.fill('#mobile-input', '+919876543210');
    await page.fill('#address-input', 'Main Street Mall, Ground Floor');
    await page.fill('#tables-count-input', '12'); // No. of Tables
    
    // 6. Submit Shop details
    await page.click('#shop-submit-btn');
    
    // 7. Verify redirect to Dashboard
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('text=Metropolitan Cafe')).toBeVisible();
  });
});
