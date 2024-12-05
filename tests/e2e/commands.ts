import { Page } from '@playwright/test';
import { verifyStepState } from './helpers';
import { MODEL_DISPLAY_VALUES, TEST_BUTTON_ACTION_TEXT } from './setup';

export const commands = {
  async waitForStateMachine(page: Page, timeout = 5000) {
    try {
      await page.waitForFunction(() => (window as any).__stateMachineReady === true, 
        { timeout }
      );
    } catch (e) {
      throw new Error('State machine not initialized in time. Check that __stateMachineReady is being set.');
    }
  },

  async getCurrentState(page: Page): Promise<string> {
    await this.waitForStateMachine(page);
    return await page.evaluate(() => (window as any).__stateMachine.state.currentState);
  },

  async waitForState(page: Page, expectedState: string, timeout = 5000) {
    await this.waitForStateMachine(page);
    try {
      await page.waitForFunction(
        (state) => (window as any).__stateMachine.state.currentState === state,
        expectedState,
        { timeout }
      );
    } catch (e) {
      const currentState = await this.getCurrentState(page);
      throw new Error(`Timeout waiting for state "${expectedState}". Current state is "${currentState}"`);
    }
  },

  async resetToHome(page: Page) {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    await this.waitForStateMachine(page);
    
    await page.evaluate(() => {
      const sm = (window as any).__stateMachine;
      sm.state.history = [];
      sm.to('Home', {});
    });

    await this.waitForState(page, 'Home');
  },

  async resetToOnboardingState(page: Page, step: 1 | 2 | 3 = 1) {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Click whichever button is present to start onboarding
    const todoButton = page.locator(`button.btn-primary:first-child:has-text("${TEST_BUTTON_ACTION_TEXT['positive-spin-cta']}")`);
    const signInButton = page.getByRole('button', { name: /sign in/i });
    
    const startButton = todoButton.or(signInButton); await startButton.click();

    if (step > 1) {
      // Fill and submit sphere form
      const nameInput = page.getByRole('textbox', { name: /name/i });
      await nameInput.fill('Test Sphere');
      
      const descInput = page.locator('textarea#description');
      await descInput.fill('Test Description for Sphere');
      
      await page.getByRole('button', { name: /continue/i }).click();
    }

    // Wait for the requested state
    await verifyStepState(
      page, 
      step === 1 
        ? `Create a ${MODEL_DISPLAY_VALUES['sphere']}` 
        : `Create a ${MODEL_DISPLAY_VALUES['orbit']}`,
      'process'
    );
  }
};