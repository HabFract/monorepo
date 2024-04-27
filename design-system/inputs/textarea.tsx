import { Textarea } from "flowbite-react";
import { TextAreaProps } from "./textarea.stories";
import WithLabel from "./label";
import './common.css';
import { CustomErrorLabel } from "../../app/src/components/forms/CreateSphere";

const TextArea: React.FC<TextAreaProps> = ({ placeholder, labelValue, id, onChange, required, withInfo, disabled, rows } : TextAreaProps) => {

  return (
    <WithLabel id={id} labelValue={labelValue} withInfo={withInfo}>
      <Textarea
        id={id}
        onChange={(e) => !!onChange ? onChange(e) : null}
        className="textarea"
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
  form: { touched, errors, setFieldValue, values },
  ...props
} : any) => {
  const { name, labelValue, value, id, placeholder, required, onChange, onBlur } = props;
  return (
    <>
      <TextArea
        id={id}
        rows={5}
        placeholder={placeholder}
        labelValue={labelValue}
        errored={errors[name]}
        required={required}
        disabled={false}
        withInfo={false}
        onChange={onChange}
      >
      </TextArea>
      {CustomErrorLabel(name, errors, touched)}
    </>
  )
}

export default TextArea