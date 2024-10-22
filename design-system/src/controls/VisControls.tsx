import React, { ReactElement, ReactNode } from "react";

import "./common.css";

export interface VisControlsProps {
  buttons: ReactElement<any, any>;
  allowPrepend?: boolean;
}

const VisControls: React.FC<VisControlsProps> = ({
  buttons,
  allowPrepend = false,
}) => {
  return (
    <div className="vis-controls">
      {allowPrepend && (
        <button className="add-node-button higher-button"></button>
      )}
      {buttons}
      {allowPrepend && (
        <button className="add-node-button lower-button"></button>
      )}
    </div>
  );
};

export default VisControls;
