export const APP_WS_PORT = import.meta.env.VITE_APP_PORT as string;
export const ADMIN_WS_PORT = import.meta.env.VITE_ADMIN_PORT;
export const NODE_ENV = import.meta.env.VITE_NODE_ENV;
export const HAPP_ID = "habit_fract";
export const HAPP_DNA_NAME = "habits";
export const HAPP_ZOME_NAME_PERSONAL_HABITS = "personal";
export const HAPP_ZOME_NAME_PROFILES = "profiles";
export const ALPHA_RELEASE_DISCLAIMER = `Thank you for being an early tester of this habit tracking app.

Please note that this is an alpha release. This means the software is still in the early stages of development and may not be fully featured.

Notably:
  - You cannot permanently store habit completion across time. It will reset your progress when you leave!
  - Profiles, social interaction, etc., will come later.
  - There is no password protection, and locally cached data is not encrypted. Please don't store sensitive information if others may access the device.

***
You may encounter bugs or unexpected behavior while using the app!
***

If you experience any issues, the best course of action is to reload the app. If you want to be super helpful, you could report the bug using the form on the Habit/Fract website. Click the feedback button on the settings menu (accessible from Home/Visualize pages) for a link.

We are actively working on improvements and appreciate your patience and feedback during this phase..
`;

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

export const ONBOARDING_FORM_TITLES = [`Create ${MODEL_DISPLAY_VALUES['sphere']}`, `Create ${MODEL_DISPLAY_VALUES['orbit']}`, `Break Up ${MODEL_DISPLAY_VALUES['orbit']}` ]
export const ONBOARDING_FORM_DESCRIPTIONS = [
  `It all starts with a ${MODEL_DISPLAY_VALUES['sphere']}. Give your goals their own little universe, dedicated to a [em]special area of your life[em] It could be health, wealth, family, or career. Give the ${MODEL_DISPLAY_VALUES['sphere']} a short name, perhaps add a description of what you want to achieve, and upload a symbol or image to remember it by.`,
  `This is where your plans take shape: let's fill your ${MODEL_DISPLAY_VALUES['sphere']} by setting up a [em]${MODEL_DISPLAY_VALUES['hierarchy']}[em] Composed of ${MODEL_DISPLAY_VALUES['orbit']}s of different scales - representing [em]behaviour you want to track[em] Start a System with a Plannit of any scale. We'll begin with a Star (representing your most significant goal) shining brightly in your System.[em] Give it a short name, extra details if desired, and fill in [em]how frequently[em] you want to track this behaviour.`,
  `Break Up ${MODEL_DISPLAY_VALUES['orbit']}` ]