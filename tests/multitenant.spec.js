import { test, expect } from '@playwright/test';

test.describe('Multi-tenant Separation & Mobile Emulation spec', () => {
  
  test('should keep shop data isolated (multi-tenancy check)', async ({ page }) => {
    // Navigate to Shop 1
    await page.goto('/menu/1?table=1&mock=true');
    await expect(page.locator('.customer-shop-title')).toContainText('Mock Cafe');
    await expect(page.locator('.customer-item-title', { hasText: 'Margherita Pizza' })).toBeVisible();

    // Now visit an invalid shop/mock setup with no menu published
    await page.goto('/menu/non-existent-shop-slug?mock=true');
    await expect(page.locator('text=Menu Unavailable')).toBeVisible();
    await expect(page.locator('.customer-item-title', { hasText: 'Margherita Pizza' })).not.toBeVisible();
  });

  test('should adjust layout structure on mobile screen viewports', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Visit Register/Login page
    await page.goto('/register?mock=true');
    
    // Validate glass panel container has proper spacing/margins on mobile sizing
    const glassPanel = page.locator('.glass-panel');
    await expect(glassPanel).toBeVisible();
    
    const panelBoundingBox = await glassPanel.boundingBox();
    expect(panelBoundingBox.width).toBeLessThan(370); // Should fit within mobile screen bounds
  });

  test('should display bottom navigation bar on mobile dashboards', async ({ page }) => {
    // Login and view dashboard
    await page.goto('/register?mock=true');
    await page.click('#toggle-auth-mode-btn'); // Switch to login
    await page.fill('#reg-email', 'example@gmail.com');
    await page.fill('#reg-password', 'password123');
    await page.click('#login-submit-btn');
    await page.waitForURL(/\/dashboard/);

    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 viewport
    
    // Check mobile bottom navigation is visible
    const bottomNav = page.locator('.dash-bottom-nav');
    await expect(bottomNav).toBeVisible();
    
    // Desktop sidebar should be hidden (width = 0 or display = none depending on media query)
    const sidebar = page.locator('.owner-sidebar');
    await expect(sidebar).not.toBeInViewport();
  });
});
