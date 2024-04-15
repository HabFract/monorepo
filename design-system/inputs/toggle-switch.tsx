
import { ToggleSwitch as FBSwitch, Label } from "flowbite-react";
import { ToggleSwitchProps } from "./toggleswitch.stories";
import { ComponentProps, FC, useState } from "react";
import { darkThemeToggleSwitch } from "../darkTheme";
import { getIconSvg } from "../icons";
import "./common.css";

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, labelValue, errored, withInfo, disabled, onClickInfo } : ToggleSwitchProps) => {
  const [switch1, setSwitch1] = useState(false);

  return (
    <div className="toggle-switch flex justify-between">
      <div className="flex justify-start h-full gap-4 items-center">
        <Label htmlFor={id} value={labelValue} />
        {withInfo ? <div className="text-primary w-4 h-4 pr-4 cursor-pointer" onClick={(e) => onClickInfo!(e)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        </div> : null }
      </div>
      <FBSwitch
        id={id}
        checked={switch1}
        color={"default"}
        theme={darkThemeToggleSwitch}
        disabled={disabled}
        className={switch1 ? "toggle-switch checked relative": "toggle-switch unchecked relative"}
        onChange={setSwitch1}>
      </FBSwitch>
      {switch1 ? (getIconSvg('tick') as FC<ComponentProps<'svg'>>)({}) : (getIconSvg('cross') as FC<ComponentProps<'svg'>>)({})}
    </div>
  );
}

export default ToggleSwitch