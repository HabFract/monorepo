export const APP_WS_PORT = import.meta.env.VITE_APP_PORT as string
export const ADMIN_WS_PORT = import.meta.env.VITE_ADMIN_PORT
export const NODE_ENV = import.meta.env.VITE_NODE_ENV
export const HAPP_ID = 'habit_fract'
export const HAPP_DNA_NAME = 'habits'
export const HAPP_ZOME_NAME_PERSONAL_HABITS = 'personal'
export const HAPP_ZOME_NAME_PROFILES = 'profiles'
export const ALPHA_RELEASE_DISCLAIMER = `Thank you for being an early tester of this habit tracking app.

Please note that this is an alpha release. This means the software is still in the early stages of development and may not be fully featured.

Notably:
  - At this point, you cannot store habit completion across time. It is more like a hierarchical to-do list, currently!
  - Profiles, social interaction, etc., will come later.
  - There is no password protection, and locally cached data is not encrypted. Please don't store sensitive information if others may access the device.

***
You may encounter bugs or unexpected behavior while using the app!
***

If you experience any issues, the best course of action is to reload the app. If you want to be super helpful, you could report the bug using the form on the Habit/Fract website. Click the feedback button on the settings menu (accessible from Home/Visualize pages) for a link.

We are actively working on improvements and appreciate your patience and feedback during this phase..
`