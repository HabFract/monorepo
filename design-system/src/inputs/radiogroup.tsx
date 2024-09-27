import { useState } from "react";
import { RadioGroupProps } from "./radiogroup.stories";

import { Label, Radio } from "flowbite-react";
import { darkRadioTheme } from "../darkTheme";
import WithLabel from "./label";
import ErrorLabel from "./errorlabel";

const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  name,
  options,
  labelValue,
  required,
  withInfo,
  disabled,
  direction,
}: RadioGroupProps) => {
  const [selected, setSelected] = useState<string>(options[0]);

  return (
    <WithLabel
      id={id}
      labelValue={labelValue}
      required={required}
      withInfo={withInfo}
    >
      <div
        data-name={name}
        className={
          direction == "vertical"
            ? "flex max-w-md flex-col gap-2"
            : "flex max-w-md flex-row gap-6"
        }
      >
        {options.map((optionText, idx) => {
          return (
            <div key={idx} className="flex items-stretch gap-2">
              <Radio
                id={id + idx.toString()}
                onChange={(e) => {
                  setSelected(e.target.value);
                }}
                theme={darkRadioTheme}
                value={optionText}
                checked={optionText == selected}
                disabled={disabled}
              ></Radio>
              <Label htmlFor={id + idx.toString()}>{optionText}</Label>
            </div>
          );
        })}
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
  form: { touched, errors, setFieldValue: _ },
  ...props
}: any) => {
  const {
    name,
    labelValue,
    options,
    direction,
    value: __,
    id,
    required,
    onBlur: ___,
  } = props;
  return (
    <>
      <RadioGroup
        name={name}
        id={id}
        direction={direction}
        options={options}
        labelValue={labelValue}
        errored={errors[name]}
        required={required}
        disabled={false}
        withInfo={false}
      ></RadioGroup>
      <ErrorLabel
        fieldName={name}
        errors={errors}
        touched={touched}
      ></ErrorLabel>
    </>
  );
};

export default RadioGroup;
