import { Page } from '@playwright/test';

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
  }
};