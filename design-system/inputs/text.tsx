import { darkThemeTextInput } from "../darkTheme";
import { getIconSvg } from "../icons";
import { TextInputProps } from "./text.stories";

import './common.css';
import { TextInput as FBTextInput } from "flowbite-react";
import WithLabel from "./label";

const TextInput: React.FC<TextInputProps> = ({ id, placeholder, labelValue, onChange, value, errored, required, withInfo, disabled, size, icon, iconSide } : TextInputProps) => {
  return (
    <WithLabel id={id} labelValue={labelValue} withInfo={withInfo}>
      <FBTextInput
        id={id}
        onChange={(e) => !!onChange ? onChange(e) : null}
        className={icon && iconSide == "left" ? "input-with-icon text-input-text" : icon && iconSide == "right" ? "input-with-icon-right text-input-text" : "text-input-text"}
        color={"default"}
        theme={darkThemeTextInput}
        icon={iconSide == "left" ? getIconSvg(icon) : undefined}
        rightIcon={iconSide == "right" ? getIconSvg(icon) : undefined}
        sizing={size}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      ></FBTextInput>
    </WithLabel>
  )
}

export const TextInputField: React.FC<{ field: any, form: any, props: TextInputProps}> = ({
  field,
  form: { touched, errors, setFieldValue, values },
  ...props
} : any) => {
  const { name, labelValue, value, icon, iconSide, size, id, placeholder, required, onChange, onBlur } = props;
  return (
    <>
      <TextInput
        id={id}
        size={size}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={errors[name]}
        required={required}
        disabled={false}
        withInfo={false}
        iconSide={iconSide}
        icon={icon}
        onChange={onChange}
      >
      </TextInput>
      {/* {CustomErrorLabel(name, errors, touched)} */}
    </>
  )
}

export default TextInput