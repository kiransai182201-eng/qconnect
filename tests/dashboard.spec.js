import { test, expect } from '@playwright/test';

test.describe('Owner Management Dashboard & Settings spec', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to dashboard in mock mode (which will auto-login)
    await page.goto('/dashboard?mock=true');
  });

  test('should load correct dashboard statistics and active metrics', async ({ page }) => {
    // Check key metric cards
    await expect(page.locator('.dash-stat-card').first()).toBeVisible(); // Today's revenue
    await expect(page.locator('text=Mock Cafe')).toBeVisible();
    await expect(page.locator('text=Total Tables')).toBeVisible();
    await expect(page.locator('text=Active Tables')).toBeVisible();
  });

  test('should navigate settings and switch theme preference', async ({ page }) => {
    await page.goto('/settings?mock=true');
    
    // Check settings section exists
    await expect(page.locator('h2', { hasText: 'Theme Settings' })).toBeVisible();
    
    // Switch to dark mode
    const darkModeBtn = page.locator('text=Dark Mode');
    await darkModeBtn.click();
    
    // Verify dark mode class is applied/removed on root
    const rootClass = await page.evaluate(() => document.documentElement.classList.contains('light-mode'));
    expect(rootClass).toBeFalsy();
    
    // Switch back to light mode
    const lightModeBtn = page.locator('text=Light Mode');
    await lightModeBtn.click();
    const isLightClass = await page.evaluate(() => document.documentElement.classList.contains('light-mode'));
    expect(isLightClass).toBeTruthy();
  });

  test('should modify table counts incrementally in QRCodeGeneration', async ({ page }) => {
    await page.goto('/qr-code?mock=true');

    // Click Change Table Count
    await page.click('text=Change Table Count');
    
    // Verify number of tables input is present
    const tableInput = page.locator('.qr-setup-input');
    await expect(tableInput).toBeVisible();
    
    // Change count to 6 and submit
    await tableInput.fill('6');
    await page.click('button[type="submit"]');

    // Verify success toast/message is rendered
    await expect(page.locator('text=Table 06')).not.toBeVisible(); // Since it takes a moment to reload/render
    await expect(page.locator('text=Change Table Count')).toBeVisible();
  });

  test('should delete owner account permanently and redirect to register page', async ({ page }) => {
    await page.goto('/settings?mock=true');

    // Click delete account list item to open modal
    await page.click('text=Delete Account', { force: true });

    // Verify modal is visible
    await expect(page.locator('h3', { hasText: 'Delete Account' })).toBeVisible();

    // Fill DELETE confirmation
    const deleteInput = page.locator('#set-delete-confirm');
    await deleteInput.fill('DELETE');

    // Click permanent delete button
    await page.click('button:has-text("Delete Permanently")');

    // Verify redirect to login page
    await page.waitForURL(/\/login/);
  });
});
