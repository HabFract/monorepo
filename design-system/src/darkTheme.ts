import { CustomFlowbiteTheme } from "flowbite-react";

const darkThemeModal: CustomFlowbiteTheme["modal"] = {
  "root": {
    "base": "fixed inset-x-0 top-0 z-50 h-screen w-full overflow-x-hidden overflow-y-auto md:inset-0 md:h-full",
    "show": {
      "on": "flex bg-black/50 dark:bg-black/80",
      "off": "hidden"
    },
    "sizes": {
      "sm": "max-w-sm",
      "md": "max-w-md",
      "lg": "max-w-lg",
      "xl": "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      "6xl": "max-w-6xl",
      "7xl": "max-w-7xl"
    },
    "positions": {
      "top-left": "items-start justify-start",
      "center": "items-center justify-center",
      "top-center": "items-start justify-center",
      "top-right": "items-start justify-end",
      "center-left": "items-center justify-start",
      "center-right": "items-center justify-end",
      "bottom-right": "items-end justify-end",
      "bottom-center": "items-end justify-center",
      "bottom-left": "items-end justify-start"
    }
  },
  "content": {
    "base": "relative h-full w-full p-4 md:h-auto",
    "inner": "relative flex max-h-[90dvh] flex-col rounded-2xl dark:bg-surface-elevated-dark shadow dark:dark:bg-surface-elevated-dark-dark"
  },
  "body": {
    "base": "flex-1 overflow-auto p-4",
    "popup": "pt-0"
  },
  "header": {
    "base": "flex items-center justify-between rounded-t border-b-0 p-4 pb-10 text-center mr-4 dark:border-gray-600",
    "popup": "border-b-0 p-2",
    "title": "w-full font-sans font-bold text-lg leading-normal text-white/70",
    "close": {
      "base": "absolute right-4 top-4 ml-auto rounded-xl bg-transparent p-1 text-white hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
      "icon": "h-6 w-6"
    }
  },
  "footer": {
    "base": "absolute inset-x-0 bottom-0 flex items-center justify-center space-x-2 rounded-b-2xl bg-modal-footer-dark/20 p-4 font-sans font-normal text-sm leading-normal text-white",
    "popup": "border-t"
  }
};

const darkThemeTextInput: CustomFlowbiteTheme["textInput"] = {
  field: {
    icon: {
      base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2",
      svg: "h-3 w-3 text-gray-100",
    },
    input: {
      colors: {
        default: 
          "w-full border border-input-border bg-input-bg px-3 py-[10px] font-sans font-light text-sm leading-normal placeholder:text-input-placeholder hover:border-accent hover:bg-gray-500 focus:border-accent focus:ring-0 focus:shadow-none dark:bg-input-bg-dark dark:text-input-text-dark",
        danger:
          "w-full border border-danger bg-input-bg px-3 py-[10px] font-sans font-light text-sm leading-normal placeholder:text-input-placeholder hover:border-accent hover:bg-gray-500 focus:border-accent focus:ring-0 focus:shadow-none dark:bg-input-bg-dark dark:text-input-text-dark",
        success:
          "w-full border border-accent bg-input-bg px-3 py-[10px] font-sans font-light text-sm leading-normal placeholder:text-input-placeholder hover:border-accent hover:bg-gray-500 focus:border-accent focus:ring-0 focus:shadow-none dark:bg-input-bg-dark dark:text-input-text-dark",
        warning:
          "w-full border border-warn bg-input-bg px-3 py-[10px] font-sans font-light text-sm leading-normal placeholder:text-input-placeholder hover:border-accent hover:bg-gray-500 focus:border-accent focus:ring-0 focus:shadow-none dark:bg-input-bg-dark dark:text-input-text-dark"
      },
    },
  },
};

const darkThemeToggleSwitch: CustomFlowbiteTheme["toggleSwitch"] = {
  toggle: {
    base: "rounded-full border group-focus:ring-4 group-focus:ring-0",
    checked: {
      on: "after:translate-x-full after:border-white",
      off: "border-0 bg-text-primary",
      color: {
        default: "border-0 bg-accent",
        failure: "border-red-900 bg-red-700",
        success: "border-green-500 bg-green-500",
        warning: "border-yellow-600 bg-yellow-600",
      },
    },
    sizes: {
      sm: "h-5 w-9 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4",
      md: "h-6 w-11 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5",
      lg: "h-7 w-14 after:absolute after:left-[4px] after:top-0.5 after:h-6 after:w-6",
    },
  },
};

const darkThemeSelect: CustomFlowbiteTheme["select"] = {
  field: {
    select: {
      base: "w-full rounded-full border-2 border-red-400",
      colors: {
        default:
          "w-full border border-input-border bg-input-bg px-3 py-[10px] font-sans font-light text-sm leading-normal text-input-text placeholder:text-input-placeholder hover:border-accent hover:bg-gray-500 focus:border-accent focus:ring-0 focus:shadow-none",
        danger:
          "w-full border border-danger bg-input-bg px-3 py-[10px] font-sans font-light text-sm leading-normal text-input-text placeholder:text-input-placeholder hover:border-accent hover:bg-gray-500 focus:border-accent focus:ring-0 focus:shadow-none",
        success:
          "w-full border border-accent bg-input-bg px-3 py-[10px] font-sans font-light text-sm leading-normal text-input-text placeholder:text-input-placeholder hover:border-accent hover:bg-gray-500 focus:border-accent focus:ring-0 focus:shadow-none",
        warning:
          "w-full border border-warn bg-input-bg px-3 py-[10px] font-sans font-light text-sm leading-normal text-input-text placeholder:text-input-placeholder hover:border-accent hover:bg-gray-500 focus:border-accent focus:ring-0 focus:shadow-none"
      },
    },
    icon: {
      svg: "h-3 w-3 text-gray-100",
    },
  },
};

const darkRadioTheme: CustomFlowbiteTheme["radio"] = {
  root: {
    base: "h-4 w-4 cursor-pointer border border-gray-300 text-accent focus:ring-2 focus:ring-primary-500",
  },
};

const darkThemeButton: CustomFlowbiteTheme["button"] = {
  base: "flex w-auto items-center justify-center border border-gray-300 text-center",
};

const darkTheme = {
  modal: darkThemeModal,
  textInput: darkThemeTextInput,
  toggleSwitch: darkThemeToggleSwitch,
  select: darkThemeSelect,
  radio: darkRadioTheme,
  button: darkThemeButton,
};

export {
  darkThemeModal,
  darkThemeButton,
  darkThemeTextInput,
  darkRadioTheme,
  darkThemeSelect,
  darkThemeToggleSwitch,
};

export default darkTheme;