import { darkThemeTextInput } from "./darkTheme";
import { TextInputProps } from "./text.stories";

import { Label, TextInput as FBTextInput } from "flowbite-react";

const TextInput: React.FC<TextInputProps> = ({ placeholder, errored, required, disabled, size } : TextInputProps) => {

  return (
    <div className="max-w-md">
      <div className="block">
        <Label htmlFor="comment" value="Your message" />
      </div>
      <FBTextInput color={"neutral"} theme={darkThemeTextInput} className="text-input" sizing={size} type="text" placeholder={placeholder} disabled={disabled} required={required}></FBTextInput>
    </div>
  )
}

export default TextInput