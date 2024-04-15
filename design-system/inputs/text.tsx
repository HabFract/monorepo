import { darkThemeTextInput } from "../darkTheme";
import { getIconSvg } from "../icons";
import { TextInputProps } from "./text.stories";

import { TextInput as FBTextInput } from "flowbite-react";
import WithLabel from "./label";

const TextInput: React.FC<TextInputProps> = ({ id, placeholder, labelValue, errored, required, withInfo, disabled, size, icon, iconSide } : TextInputProps) => {

  return (
    <WithLabel id={id} labelValue={labelValue} withInfo={withInfo}>
      <FBTextInput id={id} className={icon && iconSide == "left" ? "input-with-icon text-input-text" : icon && iconSide == "right" ? "input-with-icon-right text-input-text" : "text-input-text"} color={"default"} theme={darkThemeTextInput} icon={iconSide == "left" ? getIconSvg(icon) : undefined} rightIcon={iconSide == "right" ? getIconSvg(icon) : undefined} sizing={size} type="text" placeholder={placeholder} disabled={disabled} required={required}></FBTextInput>
    </WithLabel>
  )
}

export default TextInput