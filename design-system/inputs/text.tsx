import { darkThemeTextInput } from "../darkTheme";
import { TextInputProps } from "./text.stories";

import { Label, TextInput as FBTextInput } from "flowbite-react";

const TextInput: React.FC<TextInputProps> = ({ id, placeholder, labelValue, errored, required, disabled, size } : TextInputProps) => {

  return (
    <div className="max-w-md">
      <div className="flex justify-start">
        <Label htmlFor={id} value={labelValue} />
      </div>
      <FBTextInput id={id} color={"default"} theme={darkThemeTextInput} className="text-input-text" sizing={size} type="text" placeholder={placeholder} disabled={disabled} required={required}></FBTextInput>
    </div>
  )
}

export default TextInput