import { useState } from 'react';
import './common.css';

export interface HelperTextProps {
  onClickInfo?: () => any;
  children: React.ReactNode;
  title?: string;
  withInfo?: boolean;
  titleIcon?: React.ReactNode;
}

const HelperText: React.FC<HelperTextProps> = ({ children, title, titleIcon, withInfo = true, onClickInfo = (() => ({body: "Test tooltip content"})) } : HelperTextProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="helper-text">
      { title
        ? <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span>{titleIcon}</span>
              <span className="helper-title">{title}</span>
            </div>
            <span className="helper-content">{children}</span>
        </div>
        : children
      }
      { withInfo && 
                  <>
                    <div id="tooltip-right" role="tooltip" className={tooltipVisible ? "" : "invisible"} onClick={(e) => {
                        setTooltipVisible(false)}
                      }>
                        <h4>(Click To Hide)</h4>
                        <h3>{onClickInfo?.()?.title}</h3>
                        <p>
                          {onClickInfo?.()?.body}
                        </p>
                        <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <div className="flex h-full items-start justify-end text-primary w-8 h-8 pr-0 mb-2 cursor-pointer" onClick={(e) => {
                        setTooltipVisible(!tooltipVisible)}
                      }>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                      </svg>
                    </div>
                  </>
      }
    </div>
  )
}

export default HelperText