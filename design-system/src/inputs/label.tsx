import { getIconSvg } from "../icons";
import { Label } from "flowbite-react";
import "./common.css";

export interface LabelProps {
  id: string;
  labelValue: string;
  required?: boolean;
  withInfo?: boolean;
  onClickInfo?: (e: any) => {};
  children: React.ReactNode
}

const withLabel: React.FC<LabelProps> = ({ children, id, labelValue, withInfo, onClickInfo } : LabelProps) => {
  return (
    <div className="max-w-md">
      <div className="flex justify-between">
        <Label htmlFor={id} value={labelValue} />
        {withInfo ? <div className="text-primary w-4 h-4 pr-4 mb-2 cursor-pointer" onClick={(e) => onClickInfo!(e)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        </div> : null }
      </div>
      {children}
    </div>
  )
}

export default withLabel