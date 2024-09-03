import React, { ReactNode } from 'react';

import './common.css';

export interface VisControlsProps {
  allowAppend?: boolean;
  onAppend?: Function;
  onPrepend?: Function;
  toggleIsCompleted?: Function;
  completed?: boolean;
  buttons: ReactNode[]
}

const VisControls: React.FC<VisControlsProps> = ({ buttons, toggleIsCompleted, completed = false }, children) => {
  return (
    <div className="vis-controls">
      <button className="add-node-button higher-button"></button>
      <div className="relative">
        <object
          className='is-completed relative'
          onClick={() => { toggleIsCompleted() }}
          data={completed
              ? 'assets/checkbox-checked-is.svg' : 'assets/checkbox-empty-is.svg'} type="image/svg+xml">
        </object>
        {...buttons}
      </div>
      <button className="add-node-button lower-button"></button>
    </div>
  );
};

export default VisControls;
