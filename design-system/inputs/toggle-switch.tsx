
import { ToggleSwitch as FBSwitch, Label } from "flowbite-react";
import { ToggleSwitchProps } from "./toggleswitch.stories";
import { ComponentProps, FC, useState } from "react";
import { darkThemeToggleSwitch } from "../darkTheme";
import { getIconSvg } from "../icons";

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, label, errored, disabled, size } : ToggleSwitchProps) => {
  const [switch1, setSwitch1] = useState(false);

  return (
    <div className="flex justify-between">

      <div className="flex justify-start">
        <Label htmlFor={id} value={label} />
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