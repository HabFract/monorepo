import { Label, Textarea } from "flowbite-react";
import { TextAreaProps } from "./textarea.stories";
import './common.css';

const TextArea: React.FC<TextAreaProps> = ({ placeholder, label, id, errored, required, disabled, rows } : TextAreaProps) => {

  return (
    <div className="max-w-md">
      <div className="flex justify-start">
        <Label htmlFor={id} value={label} />
      </div>
      <Textarea id={id} className="textarea" placeholder={placeholder} required={required} disabled={disabled} rows={rows} />
    </div>
  )
}

export default TextArea