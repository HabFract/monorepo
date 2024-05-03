import { useState } from "react";
import { RadioGroupProps } from "./radiogroup.stories";

import { Label, Radio } from "flowbite-react";
import { darkRadioTheme } from "../darkTheme";
import WithLabel from "./label";

const RadioGroup: React.FC<RadioGroupProps> = ({ id, options, labelValue, errored, required, withInfo, disabled, direction } : RadioGroupProps) => {
  const [selected, setSelected] = useState<string>(options[0])

  return (

    <WithLabel id={id} labelValue={labelValue} withInfo={withInfo}>
      <div className={direction == "vertical" ? "flex max-w-md flex-col gap-2" : "flex max-w-md flex-row gap-6"}>
        {options.map((optionText, idx) => {
          return (<div key={idx} className="flex items-stretch gap-2">
            <Radio
              id={id + idx.toString()}
              onChange={(e) => {
                setSelected(e.target.value)
              }}
              theme={darkRadioTheme}
              value={optionText}
              checked={optionText == selected}
              disabled={disabled}
            ></Radio>
            <Label htmlFor={id + idx.toString()}>{optionText}</Label>
          </div>
          )
          }
        )}
      </div>
    </WithLabel>
  )
}

export default RadioGroup