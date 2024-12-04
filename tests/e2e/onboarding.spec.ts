import { test, expect } from './test-fixtures';
import { MODEL_DISPLAY_VALUES, TEST_ERROR_MESSAGES, TEST_ONBOARDING_FORM_TITLES, TEST_PAGE_COPY } from './setup';
import { verifyStepState } from './helpers';

test.describe('Home Page Password Validation and Transition to Onboarding1', () => {
  test.beforeEach(async ({ page }) => {
    await page.resetToHome();
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
    
    // Verify onboarding header appears with specific selectors
    await expect(
      page.getByRole('heading', { level: 1, name: TEST_ONBOARDING_FORM_TITLES[0] })
    ).toBeVisible();

    // Look for the back button SVG
    await expect(
      page.getByRole('button', { name: 'Go back' })
    ).toBeVisible();

    // Verify CreateSphere form fields with specific selectors
    await expect(
      page.getByRole('textbox', { name: /name/i })
    ).toBeVisible();
    
    await expect(
      page.getByRole('textbox', { name: /description/i })
    ).toBeVisible();
    
    // Verify symbol/image selector is present
    await expect(page.locator('label[for="image"]')).toBeVisible();

    await verifyStepState(page, 'Create Password', 'finish');
    await verifyStepState(
      page, 
      TEST_ONBOARDING_FORM_TITLES[0], 
      'process'
    );
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

test.describe('Sphere Creation Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.resetToHome();
    // Get to the sphere creation form
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();
  });

  test('shows validation errors for empty required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /continue/i });
    await submitButton.click();

    // Check for validation messages using centralized error messages
    await expect(
      page.getByText(TEST_ERROR_MESSAGES['sphere-name-empty'])
    ).toBeVisible();
  });

  test('validates description field constraints', async ({ page }) => {
    const descInput = page.getByLabel('Description:');
    const submitButton = page.getByRole('button', { name: /continue/i });

    await expect(descInput).toBeVisible();
    await expect(descInput).toBeEnabled();

    await descInput.click();
    await descInput.fill('short');
    await descInput.blur();
    await submitButton.click();
  
    // Verify the value was entered
    await expect(descInput).toHaveValue('short');
    
    // Verify error message
    await expect(
      page.getByText(TEST_ERROR_MESSAGES['sphere-description-short'])
    ).toBeVisible();
  });

});