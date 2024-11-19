import { RadioGroupProps } from "./radiogroup.stories";
import { Label, Radio } from "flowbite-react";
import { darkRadioTheme } from "../darkTheme";
import WithLabel from "./label";
import ErrorLabel from "./errorlabel";

const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  name,
  value,
  options,
  labelValue,
  required,
  withInfo,
  onClickInfo,
  disabled,
  direction,
  onChange,
  errored,
}: RadioGroupProps) => {
  return (
    <WithLabel
      id={id}
      labelValue={labelValue}
      required={required}
      withInfo={withInfo}
      onClickInfo={onClickInfo}
    >
      <div
        data-name={name}
        className={
          direction === "vertical"
            ? "flex max-w-md flex-col gap-2"
            : "flex max-w-md flex-row gap-6"
        }
      >
        {options.map((optionText, idx) => (
          <div key={idx} className="flex items-stretch gap-2">
            <Radio
              id={`${id}-${idx}`}
              name={name}
              onChange={onChange}
              theme={darkRadioTheme}
              value={optionText}
              checked={optionText === value}
              disabled={disabled}
            />
            <Label htmlFor={`${id}-${idx}`}>{optionText}</Label>
          </div>
        ))}
      </div>
    </WithLabel>
  );
};

export const RadioGroupField: React.FC<{
  field: any;
  form: any;
  props: RadioGroupProps;
}> = ({
  field,
  form: { touched, errors, setFieldValue, setFieldTouched },
  ...props
}: any) => {
  const {
    id,
    name,
    labelValue,
    options,
    direction,
    required,
    withInfo,
    onClickInfo,
    disabled,
  } = props;

  return (
    <>
      <RadioGroup
        id={id}
        name={name}
        value={field.value}
        direction={direction}
        options={options}
        labelValue={labelValue}
        errored={touched[field.name] && errors[field.name]}
        required={required}
        disabled={disabled}
        withInfo={withInfo}
        onClickInfo={onClickInfo}
        onChange={(e) => {
          setFieldValue(field.name, e.target.value);
          setFieldTouched(field.name);
        }}
      />
      <ErrorLabel
        fieldName={field.name}
        errors={errors}
        touched={touched}
      />
    </>
  );
};

export default RadioGroup;