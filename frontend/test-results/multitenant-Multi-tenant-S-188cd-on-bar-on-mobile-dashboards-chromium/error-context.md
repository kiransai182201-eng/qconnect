# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: multitenant.spec.js >> Multi-tenant Separation & Mobile Emulation spec >> should display bottom navigation bar on mobile dashboards
- Location: tests\multitenant.spec.js:32:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#toggle-auth-mode-btn')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6] [cursor=pointer]:
      - img [ref=e8]
      - generic [ref=e12]: QConnect
    - button "Login" [ref=e13]
  - generic [ref=e14]:
    - generic [ref=e15]:
      - heading "Register Your Shop & Get Started" [level=1] [ref=e16]
      - paragraph [ref=e17]: Join QConnect's digital ecosystem. Set up your menu, generate QR codes, and start receiving orders instantly.
    - generic [ref=e18]:
      - generic [ref=e19]:
        - heading "Shop Details" [level=2] [ref=e20]
        - generic [ref=e21]:
          - generic [ref=e22]:
            - generic [ref=e23]: Shop Name *
            - generic [ref=e24]:
              - img
              - textbox "Shop Name *" [ref=e25]:
                - /placeholder: e.g. Spice Garden Restaurant
          - generic [ref=e26]:
            - generic [ref=e27]: Owner Name *
            - generic [ref=e28]:
              - img
              - textbox "Owner Name *" [ref=e29]:
                - /placeholder: Enter Owner Name
          - generic [ref=e30]:
            - generic [ref=e31]: Shop Category *
            - generic [ref=e32]:
              - combobox "Shop Category *" [ref=e33]:
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
              - img
          - generic [ref=e34]:
            - generic [ref=e35]: Number of Tables *
            - spinbutton "Number of Tables *" [ref=e36]: "5"
      - generic [ref=e37]:
        - heading "Contact Information" [level=2] [ref=e38]
        - generic [ref=e39]:
          - generic [ref=e40]:
            - generic [ref=e41]: Mobile Number *
            - generic [ref=e42]:
              - generic: "+91"
              - textbox "Mobile Number *" [ref=e43]:
                - /placeholder: Enter 10-digit number
          - generic [ref=e44]:
            - generic [ref=e45]: Email Address *
            - generic [ref=e46]:
              - img
              - textbox "Email Address *" [ref=e47]:
                - /placeholder: owner@yourshop.com
          - generic [ref=e48]:
            - generic [ref=e49]: Shop Address *
            - generic [ref=e50]:
              - img
              - textbox "Shop Address *" [ref=e51]:
                - /placeholder: Enter complete shop address
      - generic [ref=e52]:
        - heading "Shop Logo (Optional)" [level=2] [ref=e53]
        - generic [ref=e54] [cursor=pointer]:
          - img [ref=e55]
          - generic [ref=e58]: Click to upload shop logo
          - generic [ref=e59]: PNG, JPG up to 2MB
      - generic [ref=e60]:
        - heading "Security" [level=2] [ref=e61]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]: Password *
            - generic [ref=e65]:
              - img
              - textbox "Password *" [ref=e66]:
                - /placeholder: Min 6 characters
              - button [ref=e67]:
                - img [ref=e68]
          - generic [ref=e71]:
            - generic [ref=e72]: Confirm Password *
            - generic [ref=e73]:
              - img
              - textbox "Confirm Password *" [ref=e74]:
                - /placeholder: Re-enter password
              - button [ref=e75]:
                - img [ref=e76]
      - generic [ref=e79]:
        - checkbox "I agree to the Terms & Conditions and Privacy Policy regarding data handling." [ref=e80]
        - generic [ref=e81] [cursor=pointer]:
          - text: I agree to the
          - link "Terms & Conditions" [ref=e82]:
            - /url: /terms
          - text: and
          - link "Privacy Policy" [ref=e83]:
            - /url: /privacy
          - text: regarding data handling.
      - button "Register Shop" [ref=e84]:
        - text: Register Shop
        - img [ref=e85]
    - paragraph [ref=e88]:
      - text: Already have an account?
      - button "Login" [ref=e89]
  - generic [ref=e91]: "Database Mode: ⚠️ Mock Mode"
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
  26 |     await expect(glassPanel).toBeVisible();
  27 |     
  28 |     const panelBoundingBox = await glassPanel.boundingBox();
  29 |     expect(panelBoundingBox.width).toBeLessThan(370); // Should fit within mobile screen bounds
  30 |   });
  31 | 
  32 |   test('should display bottom navigation bar on mobile dashboards', async ({ page }) => {
  33 |     // Login and view dashboard
  34 |     await page.goto('/register?mock=true');
> 35 |     await page.click('#toggle-auth-mode-btn'); // Switch to login
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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