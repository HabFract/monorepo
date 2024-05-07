import { darkThemeSelect } from "../darkTheme";
import { getIconForPlanetValue, getIconSvg } from "../icons";
import { SelectProps } from "./select.stories";
import { Select as FBSelect } from "flowbite-react";
import "./common.css";
import WithLabel from "./label";
import ErrorLabel from "./errorlabel";

const Select: React.FC<SelectProps> = ({ id, name, theme, onChange, labelValue, withInfo, required, disabled, size, icon, iconSide, options } : SelectProps) => {
  return (
    <WithLabel id={id} labelValue={labelValue} required={required} withInfo={withInfo}>
      <FBSelect id={id} 
        onChange={(e) => !!onChange ? onChange(e) : null}
        className={icon ? "input-with-icon text-input-text" : "text-input-text"}
        icon={iconSide == "left" ? getIconSvg(icon) : undefined}
        sizing={size}
        name={name}
        color={theme || "default"}
        theme={darkThemeSelect}
        disabled={disabled}
        required={required}
      >
        {typeof options[0] == 'string'
          ? options.map((optionText, idx) => <option key={idx}>{optionText}</option>)
          : options.map((option) => option)
        }
      </FBSelect>
    </WithLabel>
  )
}

export const SelectInputField: React.FC<{ field: any, form: any, props: SelectProps}> = ({
  field,
  form: { touched, errors, setFieldValue, setFieldTouched, values },
  ...props
} : any) => {
  const { id, name, labelValue, value: __, options, iconSide, size, placeholder, required, withInfo, disabled, onBlur: ___ } = props;

  let icon = props.icon;
  if(icon == "scale-planets") icon = getIconForPlanetValue(values.scale);
  return (
    <>
      <Select
        id={id}
        name={name}
        size={size}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={touched[field.name] && errors[field.name]}
        required={required}
        options={options}
        disabled={!!disabled}
        withInfo={!!withInfo}
        iconSide={iconSide || "left"}
        icon={icon}
        onChange={(e) => { setFieldValue(field.name, e.target.value); setFieldTouched(field.name) }}
        theme={(touched[field.name] && errors[field.name]?.match("required")) ? "warning" : (touched[field.name] && errors[field.name]) ? "danger" : "default"}
      >
      </Select>
      <ErrorLabel fieldName={field.name} errors={errors} touched={touched}></ErrorLabel>
    </>
  )
}

export default Select