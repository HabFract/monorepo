import { expect, Page } from "@playwright/test";

// Helper to access and manipulate global state machine, used for routing
export async function getStateMachine(page: Page) {
  return await page.evaluate(() => (window as any).__stateMachine);
}

export async function resetState(page: Page) {
  await page.evaluate(() => {
    const sm = (window as any).__stateMachine;
    sm.to('Home', {}); // Reset to initial state
  });
}

export async function getCurrentState(page: Page) {
  return await page.evaluate(() => {
    return (window as any).__stateMachine.state.currentState;
  });
}

/**
 * Verifies the state of a step in the Ant Design Steps component
 * @param page Playwright page object
 * @param stepText The text content of the step to verify
 * @param state 'process' | 'finish' | 'wait' - The expected state of the step
 */
export async function verifyStepState(
  page: Page, 
  stepText: string, 
  state: 'process' | 'finish' | 'wait'
) {
  await expect(
    page.locator(`.ant-steps-item .ant-steps-item-subtitle`)
      .filter({ hasText: stepText })
      .locator('..')  // title
      .locator('..')  // content
      .locator('..')  // container
      .locator('..')  // item
  ).toHaveClass(new RegExp(`ant-steps-item-${state}`));
}

// Optional: Helper to verify multiple steps at once
export async function verifyStepSequence(
  page: Page,
  steps: Array<{ text: string, state: 'process' | 'finish' | 'wait' }>
) {
  for (const step of steps) {
    await verifyStepState(page, step.text, step.state);
  }
}