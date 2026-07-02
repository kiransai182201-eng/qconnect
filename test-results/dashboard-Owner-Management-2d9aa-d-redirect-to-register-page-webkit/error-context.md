# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.js >> Owner Management Dashboard & Settings spec >> should delete owner account permanently and redirect to register page
- Location: tests\dashboard.spec.js:62:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
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
  3  | test.describe('Owner Management Dashboard & Settings spec', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Authenticate and load dashboard in mock mode
  6  |     await page.goto('/register?mock=true');
> 7  |     await page.click('#toggle-auth-mode-btn'); // Switch to login
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  8  |     await page.fill('#reg-email', 'example@gmail.com');
  9  |     await page.fill('#reg-password', 'password123');
  10 |     await page.click('#login-submit-btn');
  11 |     await page.waitForURL(/\/dashboard/);
  12 |   });
  13 | 
  14 |   test('should load correct dashboard statistics and active metrics', async ({ page }) => {
  15 |     // Check key metric cards
  16 |     await expect(page.locator('.dash-stat-card').first()).toBeVisible(); // Today's revenue
  17 |     await expect(page.locator('text=Mock Cafe')).toBeVisible();
  18 |     await expect(page.locator('text=Total Tables')).toBeVisible();
  19 |     await expect(page.locator('text=Active Tables')).toBeVisible();
  20 |   });
  21 | 
  22 |   test('should navigate settings and switch theme preference', async ({ page }) => {
  23 |     await page.goto('/settings?mock=true');
  24 |     
  25 |     // Check settings section exists
  26 |     await expect(page.locator('h2', { hasText: 'Theme Settings' })).toBeVisible();
  27 |     
  28 |     // Switch to dark mode
  29 |     const darkModeBtn = page.locator('text=Dark Mode');
  30 |     await darkModeBtn.click();
  31 |     
  32 |     // Verify dark mode class is applied/removed on root
  33 |     const rootClass = await page.evaluate(() => document.documentElement.classList.contains('light-mode'));
  34 |     expect(rootClass).toBeFalsy();
  35 |     
  36 |     // Switch back to light mode
  37 |     const lightModeBtn = page.locator('text=Light Mode');
  38 |     await lightModeBtn.click();
  39 |     const isLightClass = await page.evaluate(() => document.documentElement.classList.contains('light-mode'));
  40 |     expect(isLightClass).toBeTruthy();
  41 |   });
  42 | 
  43 |   test('should modify table counts incrementally in QRCodeGeneration', async ({ page }) => {
  44 |     await page.goto('/qr-code?mock=true');
  45 | 
  46 |     // Click Change Table Count
  47 |     await page.click('text=Change Table Count');
  48 |     
  49 |     // Verify number of tables input is present
  50 |     const tableInput = page.locator('.qr-setup-input');
  51 |     await expect(tableInput).toBeVisible();
  52 |     
  53 |     // Change count to 6 and submit
  54 |     await tableInput.fill('6');
  55 |     await page.click('button[type="submit"]');
  56 | 
  57 |     // Verify success toast/message is rendered
  58 |     await expect(page.locator('text=Table 06')).not.toBeVisible(); // Since it takes a moment to reload/render
  59 |     await expect(page.locator('text=Change Table Count')).toBeVisible();
  60 |   });
  61 | 
  62 |   test('should delete owner account permanently and redirect to register page', async ({ page }) => {
  63 |     await page.goto('/settings?mock=true');
  64 | 
  65 |     // Click delete account list item to open modal
  66 |     await page.click('text=Delete Account');
  67 | 
  68 |     // Verify modal is visible
  69 |     await expect(page.locator('h3', { hasText: 'Delete Account' })).toBeVisible();
  70 | 
  71 |     // Fill DELETE confirmation
  72 |     const deleteInput = page.locator('#set-delete-confirm');
  73 |     await deleteInput.fill('DELETE');
  74 | 
  75 |     // Click permanent delete button
  76 |     await page.click('button:has-text("Delete Permanently")');
  77 | 
  78 |     // Verify redirect to register page
  79 |     await page.waitForURL(/\/register/);
  80 |   });
  81 | });
  82 | 
```