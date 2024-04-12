import { CustomFlowbiteTheme } from "flowbite-react";

const darkThemeTextInput: CustomFlowbiteTheme["textInput"] = {
  field: {
    input: {
      colors: {
        default: "text-base font-normal bg-slate-800 hover:bg-slate-700 text-title border-slate-500 border-2 focus:border-transparent focus:outline-link focus:outline-offset-2 focus:outline-2 focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
        valid: "dark:bg-secondary ",
        invalid: "dark:bg-secondary ",
        disabled: "text-base font-normal bg-slate-800 hover:bg-slate-800 text-title border-slate-500 border-2 focus:border-transparent focus:outline-link focus:outline-offset-2 focus:outline-2 focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
      }
    }
  }
};

export { darkThemeTextInput }
