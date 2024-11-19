import './buttons/common.css';
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
    "base": "flex items-center justify-between rounded-t border-b-0 p-4 text-center mr-4 dark:border-gray-600",
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

// Base styles for inputs
const baseInputStyles = "w-full px-3 pl-4 py-[10px] h-[48px] font-sans font-light text-sm leading-normal text-gray-900 dark:text-input-text-dark placeholder:text-gray-400 dark:placeholder:text-input-placeholder-dark bg-input-bg dark:bg-input-bg-dark border-input-border dark:input-border-dark hover:border-primary hover:bg-surface-elevated dark:hover:border-surface-dark dark:hover:bg-surface-dark focus:border-secondary focus:ring-0 focus:shadow-none dark:focus:border-surface-top-dark";
const baseIconStyles = "input-icon ml-1 mt-1 h-8 w-8 text-input-icon dark:text-input-icon-dark pointer-events-none absolute left-0 top-1 flex items-center p-2";
// Disabled styles
const disabledStyles = "bg-gray-500 text-white border-gray-200 dark:bg-gray-800 opacity-50 dark:placeholder:text-gray-300 dark:border-gray-300 pointer-events-none";

// Variant-specific border styles
const variantStyles = {
  default: "border border-gray-300 dark:border-input-border-dark",
  danger: "border border-red-300 dark:border-danger",
  success: "border border-green-300 dark:border-accent",
  warning: "border border-yellow-300 dark:border-warn",
  disabled: disabledStyles
};

// TextInput theme
const darkThemeTextInput: CustomFlowbiteTheme["textInput"] = {
  field: {
    icon: {
      base: baseIconStyles,
      svg: ""
    },
    input: {
      colors: {
        default: `${baseInputStyles} ${variantStyles.default}`,
        danger: `${baseInputStyles} ${variantStyles.danger}`,
        success: `${baseInputStyles} ${variantStyles.success}`,
        warning: `${baseInputStyles} ${variantStyles.warning}`,
        disabled: `${baseInputStyles} ${variantStyles.disabled}`
      }
    }
  }
};

// Select theme
const darkThemeSelect: CustomFlowbiteTheme["select"] = {
  field: {
    select: {
      base: "w-full rounded-full",
      colors: {
        default: `${baseInputStyles} ${variantStyles.default}`,
        danger: `${baseInputStyles} ${variantStyles.danger}`,
        success: `${baseInputStyles} ${variantStyles.success}`,
        warning: `${baseInputStyles} ${variantStyles.warning}`,
        disabled: `${baseInputStyles} ${variantStyles.disabled}`
      }
    },
    icon: {
      base: baseIconStyles,
      svg: ""
    }
  }
};

// TextArea theme
const darkThemeTextArea: CustomFlowbiteTheme["textarea"] = {
    base: "w-full rounded-lg",
    colors: {
      default: `${baseInputStyles} h-24 ${variantStyles.default}`,
      danger: `${baseInputStyles} h-24 ${variantStyles.danger}`,
      success: `${baseInputStyles} h-24 ${variantStyles.success}`,
      warning: `${baseInputStyles} h-24 ${variantStyles.warning}`,
        disabled: `${baseInputStyles} ${variantStyles.disabled}`
    }
};

// ToggleSwitch theme
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

const darkRadioTheme: CustomFlowbiteTheme["radio"] = {
  root: {
    base: "h-4 w-4 cursor-pointer border border-gray-300 text-accent focus:ring-2 focus:ring-primary-500",
  },
};

// List Group theme
const darkThemeListGroup: CustomFlowbiteTheme["listGroup"] = {
  "root": {
    "base": "list-none rounded-xl border-[.5px] border-text bg-white text-left text-base font-sans font-bold text-text dark:border-gray-100 dark:bg-surface-dark dark:text-text-dark absolute left-8 top-8 max-w-48 "
  },
  "item": {
    "base": "[&>*]:first:rounded-t-xl [&>*]:first:rounded-b-none [&>*]:last:rounded-b-xl [&>*]:last:rounded-t-none [*:only-child]:rounded-xl [*:only-child]:hover:rounded-xl !important",
    "link": {
      "base": "flex w-full items-center border-b border-gray-200 gap-2 px-4 py-2 dark:border-gray-400 dark:hover:bg-surface-elevated-dark dark:focus:focus-styles !important",
      "active": {
        "off": "hover:bg-gray-100 hover:text-cyan-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white",
        "on": "bg-cyan-700 text-white dark:bg-gray-800"
      },
      "disabled": {
        "off": "",
        "on": "cursor-not-allowed bg-gray-400 dark:bg-gray-300 text-gray-900 hover:bg-gray-300  dark:hover:text-gray-900 focus:text-gray-900"
      },
      "href": {
        "off": "",
        "on": ""
      },
      "icon": "h-4 w-4 fill-current"
    }
  }
};

const darkTheme = {
  listGroup: darkThemeListGroup,
  modal: darkThemeModal,
  textInput: darkThemeTextInput,
  darkThemeTextArea: darkThemeTextArea,
  toggleSwitch: darkThemeToggleSwitch,
  select: darkThemeSelect,
  radio: darkRadioTheme,
};

export {
  darkThemeModal,
  darkThemeTextInput,
  darkThemeTextArea,
  darkRadioTheme,
  darkThemeSelect,
  darkThemeListGroup,
  darkThemeToggleSwitch,
};

export default darkTheme;