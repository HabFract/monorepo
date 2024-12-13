export const APP_WS_PORT = import.meta.env.VITE_APP_PORT as string;
export const ADMIN_WS_PORT = import.meta.env.VITE_ADMIN_PORT;
export const NODE_ENV = import.meta.env.VITE_NODE_ENV;
export const HAPP_ID = "habit_fract";
export const HAPP_DNA_NAME = "habits";
export const HAPP_ZOME_NAME_PERSONAL_HABITS = "personal";
export const HAPP_ZOME_NAME_PROFILES = "profiles";
export const ALPHA_RELEASE_DISCLAIMER = `Thank you for being an early tester of this app.

This is an alpha release, meaning, the software is still in the early stages and will sometimes behave weirdly!

Some features are disabled/still being updated. 

If you experience any problems, the best course of action is to reload the app. You can submit feedback or bug reports from the settings menu. Have fun!`;

export const MODEL_DISPLAY_VALUES = {
  // Model names
  sphere: "Space",
  hierarchy: "Planitt System",
  orbit: "Planitt",
  winRecord: "Orbit",
  // Orbit scale display names and their precedents
  astro: "Star", // Stood for astronomic
  sub: "Giant", // Stood for sub-astronomic
  atom: "Dwarf", // Stood for atomic
};

export const INPUT_INFO_MODALS = {
  password: {
    placeholder: "No password needed currently",
    title: "Why don't I have traditional login options?",
    body: "This is what we call a Web 3 application - congratulations on being a part of the next web! //As a consequence there is no corporate cloud login, and all you need to be secure is a safe password.//Entering it again here is how you activate your public and private keys - your digital signature in the Planitt universe.",
    footer:
      "Store your password somewhere secure; in Web 3, you are responsible for your own keys!",
  },
  scales: {
    title: "Scales, Explained",
    body: "This refers to the <em>magnitude</em> of your tracked behaviour. //We like to think of the three scales in terms of <em>Plans, Commitments, and Actions</em>. // Make an over-arching <em>Plan</em> (a star).// Link it to a number of <em>Commitment</em>s - sometimes these are the biggest personal milestones: when your attitude changes you start to make Giant steps! // Then, make the whole thing easy to carry out: write down a number of small <em>Action</em>s (Dwarves, in our language), ready to Win.",
    footer: "As you break down your Planitts, the available scale gets smaller",
  },
  ["planitt-name"]: {
    title: "Make your names short and appropriate",
    body: "Try to make the name <em>fit with the scale</em> of the Planitt. //For example, a Giant Planitt might be called <em>'Commit to running daily'</em> or 'Write a business plan'. //A Dwarf Planitt would be more like <em>'Run for 10 minutes'</em> or  'Read 40 pages of my book'.",
    footer:
      "This is just a guide, feel free to experiment with what works for you 🚀",
  },
};

export const ONBOARDING_FORM_TITLES = [
  `Create a ${MODEL_DISPLAY_VALUES["sphere"]}`,
  `Create a ${MODEL_DISPLAY_VALUES["orbit"]}`,
  `Break Up ${MODEL_DISPLAY_VALUES["orbit"]}`,
];
export const ONBOARDING_FORM_DESCRIPTIONS = [
  `It all starts with a ${MODEL_DISPLAY_VALUES["sphere"]}. Give your goals their own little universe, dedicated to a [em]special area of your life[em] It could be health, wealth, family, or career. Give the ${MODEL_DISPLAY_VALUES["sphere"]} a short name, perhaps add a description of what you want to achieve, and upload a symbol or image to remember it by.`,
  `This is where your plans take shape: let's fill your ${MODEL_DISPLAY_VALUES["sphere"]} by setting up a [em]${MODEL_DISPLAY_VALUES["hierarchy"]}[em] Composed of ${MODEL_DISPLAY_VALUES["orbit"]}s of different scales - representing [em]behaviour you want to track[em] Start a System with a Planitt of any scale. We'll begin with a Star (representing your most significant goal) shining brightly in your System.[em] Give it a short name, an intention if desired, and fill in [em]how frequently[em] you want to track this behaviour.`,
  `Break Up ${MODEL_DISPLAY_VALUES["orbit"]}`,
];

export const ERROR_MESSAGES = {
  "password-empty": "Password is a required field",
  "password-short": "Password must be at least 8 characters",
  "password-long": "Password must be at most 18 characters",
  "sphere-name-empty": "Give your Space a name",
  "sphere-description-short":
    "Your intention needs to be at least 8 characters",
  "orbit-name-empty": "Make sure to name your Planitt",
  "orbit-name-short": "Name must be at least 4 characters",
  "orbit-name-long": "Must be at most 55 characters",
  "orbit-name-letters": "Name must contain letters",
  "orbit-description-letters": "Description must contain letters",
  "orbit-start-required": "Start date/time is required",
};

export const PAGE_COPY = {
  slogan: "Let's put a plan in motion!",
  "password-notice":
    "Holochain uses public-private key pairs for encryption. We are still working on key management! For now, you can proceed without a password. Don't store anything too sensitive!",
};

export const BUTTON_ACTION_TEXT = {
  "positive-spin-cta": "Do",
  "negative-spin-cta": "Not Do",
};
