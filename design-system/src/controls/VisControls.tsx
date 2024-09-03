import React, { useRef, useEffect } from 'react';

import './common.css';

export interface VisControlsProps {
  allowAppend: boolean;
  allowPrepend: boolean;
  onAppend: Function;
  onPrepend: Function;
  toggleIsCompleted: Function;
  completed: boolean;
}

const VisControls: React.FC<VisControlsProps> = ({ toggleIsCompleted, completed = false }) => {

  return (
    <div className="vis-controls">
      <button className="add-node-button higher-button"></button>
      <img
        onClick={() => { toggleIsCompleted() }}
        className='is-completed'
        src={completed
          ? 'assets/checkbox-checked-is.svg' : 'assets/checkbox-empty-is.svg'}
      ></img>
      <button className="add-node-button lower-button"></button>
    </div>
  );
};

export default VisControls;
