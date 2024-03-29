import "./styles.css";

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "myDefault",
      values: [
        {
          name: "myDefault",
          value: "#242424", // your desired default background color
        },
        // ... other backgrounds
      ],
    },
  },
};

export default preview;
