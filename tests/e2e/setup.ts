// Copied over app copy constants for checking correct copy presence.
export const TEST_ERROR_MESSAGES = {
  'password-empty': 'Password is a required field',
  'password-short': 'Password must be at least 8 characters',
  'password-long': 'Password must be at most 18 characters',
} as const;

export const TEST_PAGE_COPY = {
  'slogan' : 'Let\'s put a plan in motion!',
  'password-notice': "Holochain uses public-private key pairs for encryption. We are still working on key management! For now, you can proceed without a password. Don't store anything too sensitive!",
} as const;

// Re-export other constants you might need in E2E tests
export const TEST_ENV = {
  APP_WS_PORT: '8888',
  ADMIN_WS_PORT: '4321',
  NODE_ENV: 'test',
  HAPP_ID: 'test',
  HAPP_DNA_NAME: 'habits',
} as const;