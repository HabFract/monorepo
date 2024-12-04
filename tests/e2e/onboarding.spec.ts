import { test, expect } from '@playwright/test';
import { TEST_ERROR_MESSAGES, TEST_PAGE_COPY } from './setup';

test.describe('Home Page Password Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
  });


  test('temp password field and login flow', async ({ page }) => {
    // First verify we're on the right page
    await expect(page.getByText(TEST_PAGE_COPY['slogan'])).toBeVisible();
    
    // Verify password field is disabled and has default value
    const passwordField = page.getByLabel(/password/i);
    await expect(passwordField).toBeDisabled();

    // Verify notice is shown
    await expect(page.getByText(TEST_PAGE_COPY['password-notice'])).toBeVisible();
    
    // Verify we can still proceed
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();
    
    // Verify we've left the home page
    await expect(page.getByText(TEST_PAGE_COPY['slogan'])).not.toBeVisible();
  });

  test.skip('password field validation', async ({ page }) => {
    // First verify we're on the right page
    await expect(page.getByText(TEST_PAGE_COPY['slogan'])).toBeVisible();
    
    
        // Test cases for invalid passwords (these should stay on the same page)
        const invalidTestCases = [
          { 
            value: '123', 
            errorMessage: TEST_ERROR_MESSAGES['password-short']
          },
          { 
            value: '1234567', 
            errorMessage: TEST_ERROR_MESSAGES['password-short']
          },
        ];
    
        const passwordField = page.getByLabel(/password/i);
        const signInButton = page.getByRole('button', { name: /sign in/i });
    
        // Test invalid passwords first
        for (const { value, errorMessage } of invalidTestCases) {
          await test.step(`Testing invalid password: ${value}`, async () => {
            await passwordField.clear();
            await passwordField.fill(value);
            await signInButton.click();
            await expect(page.getByText(errorMessage)).toBeVisible();
          });
        }
    
        // Now test a valid password - this will navigate away
        await test.step('Testing valid password submission', async () => {
          await passwordField.clear();
          await passwordField.fill('12345678');
          await signInButton.click();
          
          // Verify we've left the home page
          await expect(page.getByText(TEST_PAGE_COPY['slogan'])).not.toBeVisible();
          // Optionally verify we're on the first onboarding page
          // Add assertion for onboarding page content
        });
  });


  // If you need to test longer passwords, create a separate test
  // that starts fresh for each case
  test.skip('long password validation', async ({ page }) => {
    await expect(page.getByText(TEST_PAGE_COPY['slogan'])).toBeVisible();
    
    const passwordField = page.getByLabel(/password/i);
    const signInButton = page.getByRole('button', { name: /sign in/i });

    // Test too-long password
    await passwordField.fill('1234567890123456789');
    await signInButton.click();
    await expect(page.getByText(TEST_ERROR_MESSAGES['password-long'])).toBeVisible();
  });
});