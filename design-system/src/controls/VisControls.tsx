import React from 'react';

import './common.css';

export interface VisControlsProps {
  allowAppend?: boolean;
  onAppend?: Function;
  onPrepend?: Function;
  toggleIsCompleted?: Function;
  completed?: boolean;
}

const VisControls: React.FC<VisControlsProps> = ({ toggleIsCompleted, completed = false }, children) => {
  console.log('children.length :>> ', children);
  return (
    <div className="vis-controls">
      <button className="add-node-button higher-button"></button>
      <object 
        className='is-completed'
        onClick={() => { toggleIsCompleted() }}
        data={completed
            ? '../assets/checkbox-checked-is.svg' : '../assets/checkbox-empty-is.svg'} type="image/svg+xml">
      </object>
      <button className="add-node-button lower-button"></button>
    </div>
  );
};

export default VisControls;
