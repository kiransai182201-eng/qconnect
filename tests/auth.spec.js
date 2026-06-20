import { test, expect } from '@playwright/test';

test.describe('Authentication & Shop Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with mock parameter to force mock mode
    await page.goto('/register?mock=true');
  });

  test('should show validation error with invalid login credentials', async ({ page }) => {
    // Switch to login mode
    await page.click('#toggle-auth-mode-btn');
    
    // Attempt login with invalid credentials
    await page.fill('#reg-email', 'wrong@cafe.com');
    await page.fill('#reg-password', 'wrongpassword');
    await page.click('#login-submit-btn');

    // Verify error toast or block is displayed
    const errorText = page.locator('text=Invalid login credentials');
    await expect(errorText).toBeVisible();
  });

  test('should register a new owner and redirect to shop setup', async ({ page }) => {
    const testEmail = `owner-${Date.now()}@test.com`;
    
    // Fill signup form
    await page.fill('#reg-fullname', 'Test Chef');
    await page.fill('#reg-email', testEmail);
    await page.fill('#reg-password', 'securedpass123');
    await page.click('#login-submit-btn');

    // Should redirect to shop-setup
    await expect(page).toHaveURL(/\/shop-setup/);
  });

  test('should save shop details and redirect to dashboard/qr-code', async ({ page }) => {
    // Navigate straight to shop setup (mock session is simulated on mock mode load)
    await page.goto('/shop-setup?mock=true');
    
    // Fill shop setup details
    await page.fill('#shop-name-input', 'Espresso Express');
    await page.fill('#owner-name-input', 'Jane Doe');
    await page.fill('#mobile-input', '+919876543210');
    await page.fill('#address-input', 'Terminal 2, Metro Cafe');
    await page.fill('#tables-count-input', '8');
    
    // Submit form
    await page.click('#shop-submit-btn');

    // Should redirect to QR Code page or dashboard
    await expect(page).toHaveURL(/\/qr-code/);
  });
});
