import React, { ReactNode } from 'react';

import TickBox from './TickBox';
import './common.css';
import { OrbitNodeDetails } from '../../../ui/src/state/jotaiKeyValueStore';

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
  console.log('currentDayStatus :>> ',dateIndex,  currentDayStatus, orbitDetails);
  return (
    <div className="vis-controls">
      <button className="add-node-button higher-button"></button>
      <div className="relative">
        <TickBox completed={currentDayStatus} toggleIsCompleted={() => {setOrbitDetailsWin(dateIndex, !currentDayStatus)}} size="main" />
        {...buttons}
      </div>
      <button className="add-node-button lower-button"></button>
    </div>
  );
};

export default VisControls;
