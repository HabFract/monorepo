import { darkThemeTextInput } from "../darkTheme";
import { getIconSvg } from "../icons";
import { TextInputProps } from "./text.stories";

import './common.css';
import { TextInput as FBTextInput } from "flowbite-react";
import WithLabel from "./label";
import ErrorLabel from "./errorlabel";

const TextInput: React.FC<TextInputProps> = ({ id, name, theme, placeholder, labelValue, onChange, required, withInfo, disabled, size, icon, iconSide } : TextInputProps) => {
  return (
    <WithLabel id={id} labelValue={labelValue} required={required} withInfo={withInfo}>
      <FBTextInput
        id={id}
        name={name}
        onChange={(e) => !!onChange ? onChange(e) : null}
        className={icon && iconSide == "left" ? "input-with-icon text-input-text" : icon && iconSide == "right" ? "input-with-icon-right text-input-text" : "text-input-text"}
        color={theme || "default"}
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
  form: { touched, errors, setFieldValue: _ },
  ...props
} : any) => {
  const { name, labelValue, value: __, icon, iconSide, size, id, placeholder, required, onChange, onBlur: ___ } = props;
  return (
    <>
      <TextInput
        name={name}
        id={id}
        size={size}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={errors[name]}
        required={required}
        disabled={false}
        withInfo={false}
        iconSide={iconSide || "left"}
        icon={icon}
        onChange={onChange}
        theme={errors[name]?.match("required") ? "warning" : errors[name] ? "danger" : "default"}
      >
      </TextInput>
      <ErrorLabel fieldName={name} errors={errors} touched={touched}></ErrorLabel>
    </>
  )
}

export default TextInput