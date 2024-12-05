// Copied over app copy constants for checking correct copy presence.
export const TEST_ERROR_MESSAGES = {
  'password-empty': 'Password is a required field',
  'password-short': 'Password must be at least 8 characters',
  'password-long': 'Password must be at most 18 characters',

  'sphere-name-empty' : 'Give your Space a name',
  'sphere-description-short' : 'Your intention needs to be at least 8 characters',

  'orbit-name-empty' : 'Make sure to name your Planitt',
  'orbit-name-short': 'Name must be at least 4 characters',
  'orbit-name-long': 'Must be at most 55 characters',
  'orbit-name-letters': 'Name must contain letters',
  'orbit-description-letters': 'Description must contain letters',
  'orbit-start-required': 'Start date/time is required',
} as const;

export const TEST_PAGE_COPY = {
  'slogan' : 'Let\'s put a plan in motion!',
  'password-notice': "Holochain uses public-private key pairs for encryption. We are still working on key management! For now, you can proceed without a password. Don't store anything too sensitive!",
} as const;

export const MODEL_DISPLAY_VALUES = {
  // Model names
  sphere: 'Space',
  hierarchy: 'System',
  orbit: 'Planitt',
  winRecord: 'Orbit',
  // Orbit scale display names and their precedents
  astro: 'Star', // Stood for astronomic
  sub: 'Giant', // Stood for sub-astronomic
  atom: 'Dwarf', // Stood for atomic

}


export const TEST_BUTTON_ACTION_TEXT = {
  'positive-spin-cta': "To Do",
  'negative-spin-cta': "Not To Do"
} as const

export const TEST_ONBOARDING_FORM_TITLES = [`Create a ${MODEL_DISPLAY_VALUES['sphere']}`, `Create a ${MODEL_DISPLAY_VALUES['orbit']}`, `Break Up ${MODEL_DISPLAY_VALUES['orbit']}` ]

// Re-export other constants you might need in E2E tests
export const TEST_ENV = {
  APP_WS_PORT: '8888',
  ADMIN_WS_PORT: '4321',
  NODE_ENV: 'test',
  HAPP_ID: 'test',
  HAPP_DNA_NAME: 'habits',
} as const;