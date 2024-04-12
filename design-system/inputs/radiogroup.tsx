import { useState } from "react";
import { RadioGroupProps } from "./radiogroup.stories";

import { Label, Radio } from "flowbite-react";

const RadioGroup: React.FC<RadioGroupProps> = ({ id, options, errored, required, disabled, size } : RadioGroupProps) => {
  const [selected, setSelected] = useState<string>(options[0])

  return (
    <fieldset className="flex max-w-md flex-col gap-4" id={id}>
      {options.map((optionText, idx) => {
        return (<div key={idx} className="flex items-center gap-2">
          <Radio
            id={id + idx.toString()}
            onChange={(e) => {
              setSelected(e.target.value)
            }}
            value={optionText}
            checked={optionText == selected}
            disabled={disabled}
          ></Radio>
          <Label htmlFor={id + idx.toString()}>{optionText}</Label>
        </div>
        )
        }
      )}
    </fieldset>
  )
}

export default RadioGroup