import { Textarea } from "flowbite-react";
import { TextAreaProps } from "./textarea.stories";
import WithLabel from "./label";
import './common.css';
import ErrorLabel from "./errorlabel";

const TextArea: React.FC<TextAreaProps> = ({ placeholder, theme, labelValue, id, name, onChange, required, withInfo, disabled, rows } : TextAreaProps) => {

  return (
    <WithLabel id={id} labelValue={labelValue} required={required} withInfo={withInfo}>
      <Textarea
        id={id}
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
  form: { touched, errors, setFieldValue: _ },
  ...props
} : any) => {
  const { name, labelValue, value: __, id, placeholder, required, onChange, onBlur: ___ } = props;
  return (
    <>
      <TextArea
        id={id}
        name={name}
        rows={5}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={errors[name]}
        required={required}
        disabled={false}
        withInfo={false}
        onChange={onChange}
        theme={errors[name]?.match("required") ? "warning" : errors[name] ? "danger" : "default"}
      >
      </TextArea>
      <ErrorLabel fieldName={name} errors={errors} touched={touched}></ErrorLabel>
    </>
  )
}

export default TextArea