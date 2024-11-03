import { Flowbite } from "flowbite-react";
import "./styles.css";
import darkTheme from "../src/darkTheme";
import React from "react";

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <Flowbite theme={{ theme: darkTheme }}>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </Flowbite>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "backdrop",
      values: [
        {
          name: "backdrop",
          value: "rgba(36, 36, 36, 1)",
        },
        {
          name: "ligher",
          value: "#4E5454",
        },
      ],
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
