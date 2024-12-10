import { darkThemeTextInput } from "../../darkTheme";
import { getIconSvg } from "../icons/icons";
import { TextInputProps } from "./text.stories";

import "./common.css";
import { TextInput as FBTextInput } from "flowbite-react";
import WithLabel from "./label";
import ErrorLabel from "./errorlabel";

const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  theme: colorTheme,
  value,
  placeholder,
  labelValue,
  isListItem,
  isPassword,
  onChange,
  onBlur,
  required,
  withInfo,
  onClickInfo,
  disabled,
  size,
  icon,
  iconSide,
}: TextInputProps) => {
  return (
    <WithLabel
      id={id}
      labelValue={labelValue}
      isListItem={isListItem}
      required={required}
      withInfo={withInfo}
      onClickInfo={onClickInfo}
    >
      <FBTextInput
        id={id}
        name={name}
        theme={darkThemeTextInput}
        color={disabled ? "disabled" : colorTheme || "default"}
        defaultValue={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        onChange={(e) => {
          !!onChange ? onChange(e) : null;
        }}
        onBlur={onBlur}
        className={
          icon && iconSide == "left"
            ? "input-with-icon flex-1"
            : icon && iconSide == "right"
              ? "input-with-icon-right flex-1"
              : "flex-1"
        }
        icon={iconSide == "left" ? getIconSvg(icon) : undefined}
        rightIcon={iconSide == "right" ? getIconSvg(icon) : undefined}
        sizing={size}
        type={isPassword ? "password" : "text"}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      ></FBTextInput>
    </WithLabel>
  );
};

export const TextInputField: React.FC<{
  field: any;
  form: any;
  props: TextInputProps;
}> = ({
  field,
  form: { touched, errors, setFieldValue, setFieldTouched, submitCount },
  ...props
}: any) => {
    const {
      name,
      labelValue,
      value,
      icon,
      iconSide,
      size,
      id,
      placeholder,
      required,
      withInfo,
      onClickInfo,
      disabled,
      onBlur,
      isPassword,
      isListItem,
    } = props;

    const showError = submitCount > 0 && touched[field.name] && errors[field.name];
    return (
      <>
        <TextInput
          {...field}
          name={field.name}
          id={id}
          size={size}
          value={value}
          placeholder={placeholder}
          labelValue={labelValue}
          isListItem={isListItem}
          isPassword={isPassword}
          errored={showError}
          required={required}
          disabled={!!disabled}
          withInfo={!!withInfo}
          onClickInfo={onClickInfo}
          iconSide={iconSide || "left"}
          icon={!isPassword ? icon : getIconSvg("lock")}
          onBlur={onBlur}
          onChange={(e) => {
            setFieldValue(field.name, e.target.value);
            setFieldTouched(field.name);
          }}
          theme={showError
            ? (errors[field.name].match(/required/) ? "warn" : "danger")
            : "default"}
        ></TextInput>
        {showError &&
          <ErrorLabel
            fieldName={field.name}
            errors={errors}
            touched={touched}
          ></ErrorLabel>}
      </>
    );
  };

export default TextInput;
