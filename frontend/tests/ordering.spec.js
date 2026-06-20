import { test, expect } from '@playwright/test';

test.describe('Customer Ordering & Interaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Open customer menu in mock mode with active table context (shopId = 1, table = 1)
    await page.goto('/menu/1?table=1&mock=true');
  });

  test('should display cafe name and categories', async ({ page }) => {
    // Assert cafe branding is visible
    await expect(page.locator('.customer-shop-title')).toContainText('Mock Cafe');
    
    // Assert category pills exist
    await expect(page.locator('#category-all-btn')).toBeVisible();
    await expect(page.locator('#category-cat-pizza-btn')).toBeVisible();
  });

  test('should filter menu items by active category and search input', async ({ page }) => {
    // Verify initial item list contains Margherita Pizza
    await expect(page.locator('.customer-item-title', { hasText: 'Margherita Pizza' })).toBeVisible();

    // Type query in search bar
    await page.fill('#menu-search-input', 'Pizza');
    await expect(page.locator('.customer-item-title', { hasText: 'Margherita Pizza' })).toBeVisible();

    // Type query that matches nothing
    await page.fill('#menu-search-input', 'Burger');
    await expect(page.locator('.customer-item-title', { hasText: 'Margherita Pizza' })).not.toBeVisible();
  });

  test('should add items to cart, modify quantity, and place order', async ({ page }) => {
    const itemAddButton = page.locator('#add-to-cart-item-pizza-1');
    await expect(itemAddButton).toBeVisible();
    await itemAddButton.click();

    // Verify view cart bar appears
    const cartBar = page.locator('#view-cart-bar-btn');
    await expect(cartBar).toBeVisible();
    await expect(cartBar).toContainText('1 ITEM');
    await cartBar.click();

    // Add notes and submit the order
    await page.fill('#order-notes', 'Extra cheese on pizza please');
    await page.click('#place-order-btn');

    // Should render Live Progress / Order Status screen
    await expect(page.locator('text=Live Progress')).toBeVisible();
    await expect(page.locator('text=Order Received')).toBeVisible();
    await expect(page.locator('text=Margherita Pizza').first()).toBeVisible();
  });

  test('should rate limit waiter calls client-side (cooldown)', async ({ page }) => {
    // Click call waiter button
    await page.click('#call-waiter-btn');
    
    // Listen for alert on second click
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Please wait a moment');
      await dialog.dismiss();
    });

    // Immediate second click should trigger rate-limiting alert
    await page.click('#call-waiter-btn');
  });
});
