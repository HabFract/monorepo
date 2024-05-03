import { CustomFlowbiteTheme } from "flowbite-react";

const darkThemeTextInput: CustomFlowbiteTheme["textInput"] = {
  field: {
    "icon": {
      "base": "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2",
      "svg": "h-3 w-3 text-gray-100"
    },
    input: {
      colors: {
        default: "font-std font-sans leading-std bg-input-bg py-[10px] px-3 hover:bg-gray-500 border-input-border hover:border-text-prim placeholder-input-placeholder border-[1px] placeholder-input-std focus:border-link focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0 text-std-input",
        valid: "dark:bg-secondary ",
        invalid: "dark:bg-secondary ",
        disabled: "text-base bg-slate-800 hover:bg-slate-800 text-title border-slate-500 border-2 focus:border-transparent focus:outline-link focus:outline-offset-2 focus:outline-2 focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
      }
    }
  }
};

const darkThemeToggleSwitch: CustomFlowbiteTheme["toggleSwitch"] = {
  "toggle": {
    "base": "rounded-full border group-focus:ring-4 group-focus:ring-0",
    "checked": {
      "on": "after:translate-x-full after:border-white",
      "off": "border-0 bg-text-prim",
      "color": {
        "default": "border-0 bg-link",
        "failure": "border-red-900 bg-red-700",
        "success": "border-green-500 bg-green-500",
        "warning": "border-yellow-600 bg-yellow-600",
      }
    },
    "sizes": {
      "sm": "h-5 w-9 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4",
      "md": "h-6 w-11 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5",
      "lg": "h-7 w-14 after:absolute after:left-[4px] after:top-0.5 after:h-6 after:w-6"
    }
  }
};

const darkThemeSelect: CustomFlowbiteTheme["select"] = {
    field: {
      "select" : {
        "base": "w-full rounded-full border-2 border-red-400",
        "colors" : {
          "default": "py-[10px] px-3 text-input-text font-sans text-std-input leading-std font-std border-[1px] placeholder-input-placeholder hover:border-text-prim border-input-border leading-std bg-input-bg hover:bg-gray-500 focus:border-link focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
          "failure": "border-red-900 bg-red-700",
          "success": "border-green-500 bg-green-500",
          "warning": "border-yellow-600 bg-yellow-600",
        }
      },
      "icon": {
        "svg": "text-red-300 h-3 w-3 text-gray-100"
      },
      
    }
};

const darkRadioTheme: CustomFlowbiteTheme["radio"] = {
  "root": {
    "base": "h-4 w-4 border border-gray-300 text-link focus:ring-2 focus:ring-primary-500 cursor-pointer"
  }
}

const darkThemeButton: CustomFlowbiteTheme["button"] = {
  "base" : "w-auto flex justify-center text-center border border-gray-300" 
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
  textInput: darkThemeTextInput,
  toggleSwitch: darkThemeToggleSwitch,
  select: darkThemeSelect,
  radio: darkRadioTheme,
  button: darkThemeButton,
  label: darkThemeInputLabel,
}

export  { darkThemeButton, darkThemeTextInput, darkRadioTheme, darkThemeSelect, darkThemeInputLabel, darkThemeToggleSwitch }

export default darkTheme