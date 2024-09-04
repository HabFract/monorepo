import React, { ReactNode } from 'react';

import TickBox from './TickBox';
import './common.css';
import { OrbitNodeDetails } from '../../../ui/src/state/jotaiKeyValueStore';
import Calendar from './Calendar';

export interface VisControlsProps {
  dateIndex: string;
  orbitDetails: OrbitNodeDetails;
  setOrbitDetailsWin?: (string, boolean) => void;
  buttons: ReactNode[]
  allowAppend?: boolean;
  onAppend?: Function;
  onPrepend?: Function;
}

const VisControls: React.FC<VisControlsProps> = ({ buttons, dateIndex, orbitDetails, setOrbitDetailsWin }) => {
  const currentDayStatus = !!(orbitDetails?.wins?.[dateIndex]);
  return (
    <div className="vis-controls">
      <button className="add-node-button higher-button"></button>
      <Calendar mainCheckbox={
        <div className="tickbox-container">
          <TickBox completed={currentDayStatus} toggleIsCompleted={() => { setOrbitDetailsWin(dateIndex, !currentDayStatus) }} size="main" />
          {...buttons}
        </div>
      }></Calendar>
      <button className="add-node-button lower-button"></button>
    </div>
  );
};

export default VisControls;
