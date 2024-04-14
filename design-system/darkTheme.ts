import { CustomFlowbiteTheme } from "flowbite-react";

const darkThemeTextInput: CustomFlowbiteTheme["textInput"] = {
  field: {
    input: {
      colors: {
        default: "font-sans font-std leading-std bg-input-bg hover:bg-gray-500 border-input-border hover:border-text-prim placeholder-input-placeholder border-[1px] placeholder-input-std focus:border-link focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 text-std-input",
        valid: "dark:bg-secondary ",
        invalid: "dark:bg-secondary ",
        disabled: "text-base bg-slate-800 hover:bg-slate-800 text-title border-slate-500 border-2 focus:border-transparent focus:outline-link focus:outline-offset-2 focus:outline-2 focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
      }
    }
  }
};

const darkThemeInputLabel: CustomFlowbiteTheme["label"] = {
  "root": {
    "base": "text-std-input",
    "disabled": "opacity-50",
    "colors": {
      // "default": "color-gray-900 dark:color-white",
      // "info": "color-cyan-500 dark:color-cyan-600",
      // "failure": "color-red-700 dark:color-red-500",
      // "warning": "color-yellow-500 dark:color-yellow-600",
      // "success": "color-green-700 dark:color-green-500"
    }
  }
};

const darkTheme = {
  textInput: darkThemeTextInput
}

export  { darkThemeTextInput, darkThemeInputLabel }

export default darkTheme