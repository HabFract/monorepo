import { Flowbite } from "flowbite-react";
import "./styles.css";
import darkTheme from "../src/darkTheme";
import React from "react";
import { useThemeMode } from "flowbite-react";

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => {
      return <Flowbite theme={{ theme: darkTheme  }}>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </Flowbite>
    },
  ],
  parameters: {
    backgrounds: {
      default: "ligher",
      values: [
        {
          name: "backdrop",
          value: "#2a2a2a",
        },
        {
          name: "ligher",
          value: "#3A3A3A",
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
