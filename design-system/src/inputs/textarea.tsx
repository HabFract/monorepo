import { Textarea } from "flowbite-react";
import { TextAreaProps } from "./textarea.stories";
import WithLabel from "./label";
import './common.css';
import ErrorLabel from "./errorlabel";

const TextArea: React.FC<TextAreaProps> = ({ value, placeholder, theme, labelValue, id, name, onChange, required, withInfo, disabled, rows } : TextAreaProps) => {

  return (
    <WithLabel id={id} labelValue={labelValue} required={required} withInfo={withInfo} isListItem={false}>
      <Textarea
        id={id}
        value={value}
        name={name}
        onChange={(e) => !!onChange ? onChange(e) : null}
        className={"textarea " + (theme || "default")}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
      />
    </WithLabel>
  )
}

export const TextAreaField: React.FC<{ field: any, form: any, props: TextAreaProps}> = ({
  field,
  form: { touched, errors, setFieldValue, setFieldTouched },
  ...props
} : any) => {
  const { name, labelValue, value, id, placeholder, required, disabled, withInfo, onBlur: ___ } = props;
  return (
    <>
      <TextArea
        id={id}
        name={name}
        value={field?.value || value}
        rows={5}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={touched[field.name] && errors[field.name]}
        required={required}
        disabled={!!disabled}
        withInfo={!!withInfo}
        onChange={(e) => { setFieldValue(field.name, e.target.value); setFieldTouched(field.name) }}
        theme={(touched[field.name] && errors[field.name]?.match("required")) ? "warning" : (touched[field.name] && errors[field.name]) ? "danger" : "default"}
      >
      </TextArea>
      <ErrorLabel fieldName={field.name} errors={errors} touched={touched}></ErrorLabel>
    </>
  )
}

export default TextArea