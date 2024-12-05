import { test as base } from '@playwright/test';
import { commands } from './commands';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Add error handling
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.error('Browser page error:', error.message);
    });

    // Add our custom methods
    page.waitForState = commands.waitForState.bind(commands, page);
    page.getCurrentState = commands.getCurrentState.bind(commands, page);
    page.resetToHome = commands.resetToHome.bind(commands, page);
    page.resetToOnboardingState = commands.resetToOnboardingState.bind(commands, page);
    
    await use(page);
  },
});

declare module '@playwright/test' {
  interface Page {
    waitForState(state: string): Promise<void>;
    getCurrentState(): Promise<string>;
    resetToHome(): Promise<void>;
    resetToOnboardingState(step?: 1 | 2 | 3): Promise<void>;
  }
}

export { expect } from '@playwright/test';