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
  form: { touched, errors, setFieldValue, setFieldTouched },
  ...props
} : any) => {
  const { name, labelValue, value: __, icon, iconSide, size, id, placeholder, required, withInfo, disabled, onBlur: ___ } = props;
  return (
    <>
      <TextInput
        name={name}
        id={id}
        size={size}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={touched[field.name] && errors[field.name]}
        required={required}
        disabled={!!disabled}
        withInfo={!!withInfo}
        iconSide={iconSide || "left"}
        icon={icon}
        onChange={(e) => { setFieldValue(field.name, e.target.value); setFieldTouched(field.name) }}
        theme={(touched[field.name] && errors[field.name]?.match("required")) ? "warning" : (touched[field.name] && errors[field.name]) ? "danger" : "default"}
      >
      </TextInput>
      <ErrorLabel fieldName={field.name} errors={errors} touched={touched}></ErrorLabel>
    </>
  )
}

export default TextInput