import { darkThemeTextInput } from "../darkTheme";
import { getIconSvg } from "../icons";
import { TextInputProps } from "./text.stories";

import { Label, TextInput as FBTextInput } from "flowbite-react";

const TextInput: React.FC<TextInputProps> = ({ id, placeholder, labelValue, errored, required, disabled, size, icon, iconSide } : TextInputProps) => {

  return (
    <div className="max-w-md">
      <div className="flex justify-start">
        <Label htmlFor={id} value={labelValue} />
      </div>
      <FBTextInput id={id} className={icon && iconSide == "left" ? "input-with-icon text-input-text" : icon && iconSide == "right" ? "input-with-icon-right text-input-text" : "text-input-text"} color={"default"} theme={darkThemeTextInput} icon={iconSide == "left" ? getIconSvg(icon) : undefined} rightIcon={iconSide == "right" ? getIconSvg(icon) : undefined} sizing={size} type="text" placeholder={placeholder} disabled={disabled} required={required}></FBTextInput>
    </div>
  )
}

export default TextInput