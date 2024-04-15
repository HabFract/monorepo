import { darkThemeSelect } from "../darkTheme";
import { getIconSvg } from "../icons";
import { SelectProps } from "./select.stories";
import { Select as FBSelect } from "flowbite-react";
import "./common.css";
import WithLabel from "./label";

const Select: React.FC<SelectProps> = ({ id, placeholder, labelValue, withInfo, errored, required, disabled, size, icon, iconSide, options } : SelectProps) => {
  return (
    <WithLabel id={id} labelValue={labelValue} withInfo={withInfo}>
      <FBSelect id={id} className={icon ? "input-with-icon text-input-text" : "text-input-text"} icon={iconSide == "left" ? getIconSvg(icon) : undefined} sizing={size} color={"default"} theme={darkThemeSelect} disabled={disabled} required={required}>
          {options.map((optionText, idx) => <option key={idx}>{optionText}</option>)}
      </FBSelect>
    </WithLabel>
  )
}

export default Select