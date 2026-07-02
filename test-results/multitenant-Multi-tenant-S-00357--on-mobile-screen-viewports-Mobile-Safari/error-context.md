# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: multitenant.spec.js >> Multi-tenant Separation & Mobile Emulation spec >> should adjust layout structure on mobile screen viewports
- Location: tests\multitenant.spec.js:17:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.glass-panel')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.glass-panel')

```

```yaml
- main:
  - text: QConnect
  - button "Login"
  - heading "Register Your Shop & Get Started" [level=1]
  - paragraph: Join QConnect's digital ecosystem. Set up your menu, generate QR codes, and start receiving orders instantly.
  - heading "Shop Details" [level=2]
  - text: Shop Name *
  - textbox "Shop Name *":
    - /placeholder: e.g. Spice Garden Restaurant
  - text: Owner Name *
  - textbox "Owner Name *":
    - /placeholder: Enter Owner Name
  - text: Shop Category *
  - combobox "Shop Category *":
    - option "Select Category" [disabled] [selected]
    - option "Restaurant"
    - option "Cafe"
    - option "Bakery"
    - option "Hotel"
    - option "Food Truck"
    - option "Cloud Kitchen"
    - option "Sweet Shop"
    - option "Juice Bar"
    - option "Ice Cream Parlor"
    - option "Dhaba"
  - text: Number of Tables *
  - spinbutton "Number of Tables *": "5"
  - heading "Contact Information" [level=2]
  - text: Mobile Number * +91
  - textbox "Mobile Number *":
    - /placeholder: Enter 10-digit number
  - text: Email Address *
  - textbox "Email Address *":
    - /placeholder: owner@yourshop.com
  - text: Shop Address *
  - textbox "Shop Address *":
    - /placeholder: Enter complete shop address
  - heading "Shop Logo (Optional)" [level=2]
  - text: Click to upload shop logo PNG, JPG up to 2MB
  - heading "Security" [level=2]
  - text: Password *
  - textbox "Password *":
    - /placeholder: Min 6 characters
  - button
  - text: Confirm Password *
  - textbox "Confirm Password *":
    - /placeholder: Re-enter password
  - button
  - checkbox "I agree to the Terms & Conditions and Privacy Policy regarding data handling."
  - text: I agree to the
  - link "Terms & Conditions":
    - /url: /terms
  - text: and
  - link "Privacy Policy":
    - /url: /privacy
  - text: regarding data handling.
  - button "Register Shop"
  - paragraph:
    - text: Already have an account?
    - button "Login"
  - text: "Database Mode: ⚠️ Mock Mode"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Multi-tenant Separation & Mobile Emulation spec', () => {
  4  |   
  5  |   test('should keep shop data isolated (multi-tenancy check)', async ({ page }) => {
  6  |     // Navigate to Shop 1
  7  |     await page.goto('/menu/1?table=1&mock=true');
  8  |     await expect(page.locator('.customer-shop-title')).toContainText('Mock Cafe');
  9  |     await expect(page.locator('.customer-item-title', { hasText: 'Margherita Pizza' })).toBeVisible();
  10 | 
  11 |     // Now visit an invalid shop/mock setup with no menu published
  12 |     await page.goto('/menu/non-existent-shop-slug?mock=true');
  13 |     await expect(page.locator('text=Menu Unavailable')).toBeVisible();
  14 |     await expect(page.locator('.customer-item-title', { hasText: 'Margherita Pizza' })).not.toBeVisible();
  15 |   });
  16 | 
  17 |   test('should adjust layout structure on mobile screen viewports', async ({ page }) => {
  18 |     // Set viewport to mobile size
  19 |     await page.setViewportSize({ width: 375, height: 667 });
  20 |     
  21 |     // Visit Register/Login page
  22 |     await page.goto('/register?mock=true');
  23 |     
  24 |     // Validate glass panel container has proper spacing/margins on mobile sizing
  25 |     const glassPanel = page.locator('.glass-panel');
> 26 |     await expect(glassPanel).toBeVisible();
     |                              ^ Error: expect(locator).toBeVisible() failed
  27 |     
  28 |     const panelBoundingBox = await glassPanel.boundingBox();
  29 |     expect(panelBoundingBox.width).toBeLessThan(370); // Should fit within mobile screen bounds
  30 |   });
  31 | 
  32 |   test('should display bottom navigation bar on mobile dashboards', async ({ page }) => {
  33 |     // Login and view dashboard
  34 |     await page.goto('/register?mock=true');
  35 |     await page.click('#toggle-auth-mode-btn'); // Switch to login
  36 |     await page.fill('#reg-email', 'example@gmail.com');
  37 |     await page.fill('#reg-password', 'password123');
  38 |     await page.click('#login-submit-btn');
  39 |     await page.waitForURL(/\/dashboard/);
  40 | 
  41 |     // Set mobile viewport
  42 |     await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 viewport
  43 |     
  44 |     // Check mobile bottom navigation is visible
  45 |     const bottomNav = page.locator('.dash-bottom-nav');
  46 |     await expect(bottomNav).toBeVisible();
  47 |     
  48 |     // Desktop sidebar should be hidden (width = 0 or display = none depending on media query)
  49 |     const sidebar = page.locator('.owner-sidebar');
  50 |     await expect(sidebar).not.toBeInViewport();
  51 |   });
  52 | });
  53 | 
```