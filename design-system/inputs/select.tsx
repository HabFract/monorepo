import { SelectProps } from "./select.stories";
import { Label, Select as FBSelect } from "flowbite-react";


const Select: React.FC<SelectProps> = ({ placeholder, errored, required, disabled, size, options } : SelectProps) => {

  return (
    <div className="max-w-md">
      <FBSelect disabled={disabled} required={required}>
          {options.map((optionText, idx) => <option key={idx}>{optionText}</option>)}
      </FBSelect>
    </div>
  )
}

export default Select