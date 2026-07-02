# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Authentication & Shop Onboarding Flow >> should show validation error with invalid login credentials
- Location: tests\auth.spec.js:9:3

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
> 11 |     await page.click('#toggle-auth-mode-btn');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  41 |     await page.fill('#shop-name-input', 'Espresso Express');
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