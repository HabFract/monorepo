import React, { ReactNode } from 'react';

import TickBox from './TickBox';
import './common.css';
import { OrbitNodeDetails } from '../../../ui/src/state/jotaiKeyValueStore';
import Calendar from './Calendar';
import { DateTime } from 'luxon';

export interface VisControlsProps {
  orbitDetails: OrbitNodeDetails;
  setOrbitDetailsWin?: (string, boolean) => void;
  currentDate: DateTime;
  setNewDate: Function;
  buttons: ReactNode[]
  allowPrepend?: boolean;
  onAppend?: Function;
  onPrepend?: Function;
}

const VisControls: React.FC<VisControlsProps> = ({ buttons, orbitDetails, setOrbitDetailsWin, setNewDate, currentDate, allowPrepend = false }) => {
  const dateIndex = currentDate.toISODate();
  const currentDayStatus = !!(orbitDetails?.wins?.[dateIndex]);
  console.log("dd", dateIndex, orbitDetails?.wins)
  return (
    <div className="vis-controls">
      {allowPrepend && <button className="add-node-button higher-button"></button>}
      <Calendar
        currentDate={currentDate}
        setNewDate={setNewDate}
        orbitWins={orbitDetails?.wins}
        mainCheckbox={
        <div className="tickbox-container">
          <TickBox completed={currentDayStatus} toggleIsCompleted={() => { setOrbitDetailsWin(dateIndex, !currentDayStatus) }} size="main" />
          {...buttons}
        </div>
      }></Calendar>
      {allowPrepend && <button className="add-node-button lower-button"></button>}
    </div>
  );
};

export default VisControls;
