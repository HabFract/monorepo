import { darkThemeTextInput } from "../darkTheme";
import { getIconSvg } from "../icons";
import { TextInputProps } from "./text.stories";

import './common.css';
import { TextInput as FBTextInput } from "flowbite-react";
import WithLabel from "./label";
import ErrorLabel from "./errorlabel";

const TextInput: React.FC<TextInputProps> = ({ id, name, theme, value, placeholder, labelValue, isListItem, onChange, onBlur, required, withInfo, disabled, size, icon, iconSide } : TextInputProps) => {
  return (
    <WithLabel id={id} labelValue={labelValue} isListItem={isListItem} required={required} withInfo={withInfo}>
      <FBTextInput
        id={id}
        name={name}
        defaultValue={value}
        onKeyDown={(e) => {           
          if(e.key === 'Enter'){
            e.currentTarget.blur(); 
          }}
        }
        onChange={(e) => {
            !!onChange ? onChange(e) : null
          }
        }
        onBlur={onBlur}
        className={icon && iconSide == "left" ? "input-with-icon text-input-text flex-1" : icon && iconSide == "right" ? "input-with-icon-right text-input-text flex-1" : "text-input-text flex-1"}
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
  const { name, labelValue, value, icon, iconSide, size, id, placeholder, required, withInfo, disabled, onBlur, isListItem } = props;
  return (
    <>
      <TextInput
        name={name}
        id={id}
        size={size}
        value={value}
        placeholder={placeholder}
        labelValue={labelValue}
        isListItem={isListItem}
        errored={touched[field.name] && errors[field.name]}
        required={required}
        disabled={!!disabled}
        withInfo={!!withInfo}
        iconSide={iconSide || "left"}
        icon={icon}
        onBlur={onBlur}
        onChange={(e) => {
            setFieldValue(field.name, e.target.value);
            setFieldTouched(field.name)
          }
        }
        theme={(touched[field.name] && errors[field.name]?.match("required")) ? "warning" : (touched[field.name] && errors[field.name]) ? "danger" : "default"}
      >
      </TextInput>
      <ErrorLabel fieldName={field.name} errors={errors} touched={touched}></ErrorLabel>
    </>
  )
}

export default TextInput