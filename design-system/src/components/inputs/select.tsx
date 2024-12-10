import { darkThemeSelect } from "../../darkTheme";
import { getIconForPlanetValue, getIconSvg } from "../icons/icons";
import { SelectProps } from "./select.stories";
import { Select as FBSelect } from "flowbite-react";
import "./common.css";
import WithLabel from "./label";
import ErrorLabel from "./errorlabel";
import { cloneElement } from "react";

const Select: React.FC<SelectProps> = ({
  id,
  value,
  name,
  theme: colorTheme,
  onChange,
  onBlur,
  labelValue,
  withInfo,
  onClickInfo,
  required,
  disabled,
  size,
  icon,
  iconSide,
  options,
}: SelectProps) => {
  return (
    <WithLabel
      id={id}
      labelValue={labelValue}
      required={required}
      withInfo={withInfo}
      onClickInfo={onClickInfo}
    >
      <FBSelect
        id={id}
        onChange={(e) => (!!onChange ? onChange(e) : null)}
        onBlur={(e) => (!!onBlur ? onBlur(e) : null)}
        className={icon ? "input-with-icon text-input-text" : "text-input-text"}
        icon={iconSide == "left" ? getIconSvg(icon) : undefined}
        sizing={size}
        name={name}
        value={value}
        color={disabled ? "disabled" : colorTheme || "default"}
        theme={darkThemeSelect}
        disabled={disabled}
        required={required}
      >
        {typeof options[0] == "string"
          ? options.map((optionText, idx) => (
              <option key={idx}>{optionText}</option>
            ))
          : options.map((option, i) => cloneElement(option, { key: i }))}
      </FBSelect>
    </WithLabel>
  );
};

export const SelectInputField: React.FC<{
  field: any;
  form: any;
  props: SelectProps;
}> = ({
  field,
  form: { touched, errors, setFieldValue, setFieldTouched },
  ...props
}: any) => {
  const {
    id,
    name,
    labelValue,
    value,
    options,
    iconSide,
    size,
    icon,
    placeholder,
    required,
    withInfo,
    onClickInfo,
    disabled,
    onBlur,
  } = props;
  return (
    <>
      <Select
        id={id}
        name={name}
        value={field?.value || value}
        size={size}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={touched[field.name] && errors[field.name]}
        required={required}
        options={options}
        disabled={!!disabled}
        withInfo={!!withInfo}
        onClickInfo={onClickInfo}
        iconSide={iconSide || "left"}
        icon={icon}
        onBlur={onBlur}
        onChange={(e) => {
          setFieldValue(field.name, e.target.value);
          setFieldTouched(field.name);
        }}
        theme={
          touched[field.name] && errors[field.name]?.match("required")
            ? "warning"
            : touched[field.name] && errors[field.name]
              ? "danger"
              : "default"
        }
      ></Select>
      <ErrorLabel
        fieldName={field.name}
        errors={errors}
        touched={touched}
      ></ErrorLabel>
    </>
  );
};

export default Select;
