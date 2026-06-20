# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Authentication & Shop Onboarding Flow >> should save shop details and redirect to dashboard/qr-code
- Location: tests\auth.spec.js:36:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#shop-name-input')
    - locator resolved to <input value="" required="" type="text" id="shop-name-input" placeholder="e.g. Savory Bistro"/>
    - fill("Espresso Express")
  - attempting fill action
    - waiting for element to be visible, enabled and editable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - heading "Q Connect" [level=2] [ref=e9]
      - paragraph [ref=e10]: Register Your Cafe
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Full Name
        - textbox "Full Name" [ref=e14]:
          - /placeholder: John Doe
      - generic [ref=e15]:
        - generic [ref=e16]: Email
        - textbox "Email" [ref=e17]:
          - /placeholder: owner@cafe.com
      - generic [ref=e18]:
        - generic [ref=e19]: Password
        - textbox "Password" [ref=e20]:
          - /placeholder: ••••••••
      - button "Register" [ref=e21]:
        - text: Register
        - img [ref=e22]
      - generic [ref=e26]: OR
      - button "Google logo Sign up with Google" [ref=e28]:
        - img "Google logo" [ref=e29]
        - text: Sign up with Google
    - button "Already have an account?" [ref=e31]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication & Shop Onboarding Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigate with mock parameter to force mock mode
  6  |     await page.goto('/register?mock=true');
  7  |   });
  8  | 
  9  |   test('should show validation error with invalid login credentials', async ({ page }) => {
  10 |     // Switch to login mode
  11 |     await page.click('#toggle-auth-mode-btn');
  12 |     
  13 |     // Attempt login with invalid credentials
  14 |     await page.fill('#reg-email', 'wrong@cafe.com');
  15 |     await page.fill('#reg-password', 'wrongpassword');
  16 |     await page.click('#login-submit-btn');
  17 | 
  18 |     // Verify error toast or block is displayed
  19 |     const errorText = page.locator('text=Invalid login credentials');
  20 |     await expect(errorText).toBeVisible();
  21 |   });
  22 | 
  23 |   test('should register a new owner and redirect to shop setup', async ({ page }) => {
  24 |     const testEmail = `owner-${Date.now()}@test.com`;
  25 |     
  26 |     // Fill signup form
  27 |     await page.fill('#reg-fullname', 'Test Chef');
  28 |     await page.fill('#reg-email', testEmail);
  29 |     await page.fill('#reg-password', 'securedpass123');
  30 |     await page.click('#login-submit-btn');
  31 | 
  32 |     // Should redirect to shop-setup
  33 |     await expect(page).toHaveURL(/\/shop-setup/);
  34 |   });
  35 | 
  36 |   test('should save shop details and redirect to dashboard/qr-code', async ({ page }) => {
  37 |     // Navigate straight to shop setup (mock session is simulated on mock mode load)
  38 |     await page.goto('/shop-setup?mock=true');
  39 |     
  40 |     // Fill shop setup details
> 41 |     await page.fill('#shop-name-input', 'Espresso Express');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  42 |     await page.fill('#owner-name-input', 'Jane Doe');
  43 |     await page.fill('#mobile-input', '+919876543210');
  44 |     await page.fill('#address-input', 'Terminal 2, Metro Cafe');
  45 |     await page.fill('#tables-count-input', '8');
  46 |     
  47 |     // Submit form
  48 |     await page.click('#shop-submit-btn');
  49 | 
  50 |     // Should redirect to QR Code page or dashboard
  51 |     await expect(page).toHaveURL(/\/qr-code/);
  52 |   });
  53 | });
  54 | 
```