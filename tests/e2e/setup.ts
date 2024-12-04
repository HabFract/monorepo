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

export const MODEL_DISPLAY_VALUES = {
  // Model names
  sphere: 'Space',
  hierarchy: 'System',
  orbit: 'Plannit',
  winRecord: 'Orbit',
  // Orbit scale display names and their precedents
  astro: 'Star', // Stood for astronomic
  sub: 'Giant', // Stood for sub-astronomic
  atom: 'Dwarf', // Stood for atomic

}

export const TEST_ONBOARDING_FORM_TITLES = [`Create a ${MODEL_DISPLAY_VALUES['sphere']}`, `Create a ${MODEL_DISPLAY_VALUES['orbit']}`, `Break Up ${MODEL_DISPLAY_VALUES['orbit']}` ]

// Re-export other constants you might need in E2E tests
export const TEST_ENV = {
  APP_WS_PORT: '8888',
  ADMIN_WS_PORT: '4321',
  NODE_ENV: 'test',
  HAPP_ID: 'test',
  HAPP_DNA_NAME: 'habits',
} as const;