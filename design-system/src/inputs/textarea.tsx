import { Textarea } from "flowbite-react";
import { TextAreaProps } from "./textarea.stories";
import WithLabel from "./label";
import "./common.css";
import ErrorLabel from "./errorlabel";
import { darkThemeTextArea } from "../darkTheme";

const TextArea: React.FC<TextAreaProps> = ({
  value,
  placeholder,
  theme: colorTheme,
  labelValue,
  id,
  name,
  onChange,
  required,
  withInfo,
  disabled,
  rows,
}: TextAreaProps) => {
  return (
    <WithLabel
      id={id}
      labelValue={labelValue}
      required={required}
      withInfo={withInfo}
      isListItem={false}
    >
      <Textarea
        id={id}
        value={value}
        name={name}
        onChange={(e) => (!!onChange ? onChange(e) : null)}
        className={"textarea " + (colorTheme || "default")}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        theme={darkThemeTextArea}
        color={disabled ? "disabled" : colorTheme || "default"}
        rows={rows}
      />
    </WithLabel>
  );
};

export const TextAreaField: React.FC<{
  field: any;
  form: any;
  props: TextAreaProps;
}> = ({
  field,
  form: { touched, errors, setFieldValue, setFieldTouched, submitCount },
  ...props
}: any) => {
  const {
    name,
    labelValue,
    value,
    id,
    placeholder,
    required,
    disabled,
    withInfo,
    onBlur: ___,
  } = props;

  const showError = submitCount > 0 && touched[field.name] && errors[field.name];
  return (
    <>
      <TextArea
        id={id}
        name={name}
        value={field?.value || value}
        rows={5}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={showError}
        required={required}
        disabled={!!disabled}
        withInfo={!!withInfo}
        onChange={(e) => {
          setFieldValue(field.name, e.target.value);
          setFieldTouched(field.name);
        }}
        theme={showError
          ? "danger"
          : "default"}
      ></TextArea>
      {showError && <ErrorLabel
        fieldName={field.name}
        errors={errors}
        touched={touched}
      ></ErrorLabel>}
    </>
  );
};

export default TextArea;
