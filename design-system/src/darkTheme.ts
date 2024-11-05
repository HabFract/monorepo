import { CustomFlowbiteTheme } from "flowbite-react";

const darkThemeModal: CustomFlowbiteTheme["modal"] = {
"root": {
    "base": "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
    "show": {
      "on": "flex bg-black bg-opacity-50 dark:bg-opacity-80",
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
    "inner": "relative bg-modal-bg flex max-h-[90dvh] flex-col rounded-2xl shadow dark:bg-gray-700"
  },
  "body": {
    "base": "flex-1 overflow-auto p-4",
    "popup": "pt-0"
  },
  "header": {
    "base": "flex mr-4 items-center justify-between rounded-t border-b-0 p-4 pb-10 text-center dark:border-gray-600",
    "popup": "border-b-0 p-2",
    "title": "font-sans font-bold text-white text-lg text-opacity-70 leading-std w-full",
    "close": {
      "base": "ml-auto absolute top-4 right-4 items-center rounded-xl bg-transparent p-1 text-white hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
      "icon": "h-6 w-6"
    }
  },
  "footer": {
    "base": "absolute bottom-0 inset-x-0 flex items-center space-x-2 bg-modal-bottom-bg text-[#ffffff] text-[14px] bg-opacity-20 justify-center font-sans font-medium text-center leading-lg rounded-2xl p-4 rounded-t-none",
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
          "font-std font-sans leading-std bg-input-bg py-[10px] px-3 hover:bg-gray-500 border-input-border hover:border-text-prim placeholder-input-placeholder border-[1px] placeholder-input-std focus:border-primary focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 text-std-input",
        danger:
          "font-std font-sans leading-std bg-input-bg py-[10px] px-3 hover:bg-gray-500 border-input-border hover:border-text-prim placeholder-input-placeholder border-[1px] placeholder-input-std focus:border-primary focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 text-std-input border-danger",
        success:
          "font-std font-sans leading-std bg-input-bg py-[10px] px-3 hover:bg-gray-500 border-input-border hover:border-text-prim placeholder-input-placeholder border-[1px] placeholder-input-std focus:border-primary focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 text-std-input border-link",
        warning:
          "font-std font-sans leading-std bg-input-bg py-[10px] px-3 hover:bg-gray-500 border-input-border hover:border-text-prim placeholder-input-placeholder border-[1px] placeholder-input-std focus:border-primary focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 text-std-input border-warn",
      },
    },
  },
};

const darkThemeToggleSwitch: CustomFlowbiteTheme["toggleSwitch"] = {
  toggle: {
    base: "rounded-full border group-focus:ring-4 group-focus:ring-0",
    checked: {
      on: "after:translate-x-full after:border-white",
      off: "border-0 bg-text-prim",
      color: {
        default: "border-0 bg-link",
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
          "py-[10px] px-3 text-input-text font-sans text-std-input leading-std font-std border-[1px] placeholder-input-placeholder hover:border-text-prim border-input-border leading-std bg-input-bg hover:bg-gray-500 focus:border-link focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
        danger:
          "py-[10px] px-3 text-input-text font-sans text-std-input leading-std font-std border-[1px] placeholder-input-placeholder hover:border-text-prim border-input-border leading-std bg-input-bg hover:bg-gray-500 focus:border-link focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 border-danger",
        success:
          "py-[10px] px-3 text-input-text font-sans text-std-input leading-std font-std border-[1px] placeholder-input-placeholder hover:border-text-prim border-input-border leading-std bg-input-bg hover:bg-gray-500 focus:border-link focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 border-link",
        warning:
          "py-[10px] px-3 text-input-text font-sans text-std-input leading-std font-std border-[1px] placeholder-input-placeholder hover:border-text-prim border-input-border leading-std bg-input-bg hover:bg-gray-500 focus:border-link focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 border-warn",
      },
    },
    icon: {
      svg: "text-red-300 h-3 w-3 text-gray-100",
    },
  },
};

const darkRadioTheme: CustomFlowbiteTheme["radio"] = {
  root: {
    base: "h-4 w-4 border border-gray-300 text-link focus:ring-2 focus:ring-primary-500 cursor-pointer",
  },
};

const darkThemeButton: CustomFlowbiteTheme["button"] = {
  base: "w-auto flex justify-center items-center text-center border border-gray-300",
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
