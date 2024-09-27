import React, { ReactNode } from "react";

import TickBox from "./TickBox";
import "./common.css";
import { OrbitNodeDetails } from "@ui/src/state/types";
import Calendar from "./Calendar";
import { DateTime } from "luxon";

export interface VisControlsProps {
  orbitDetails: OrbitNodeDetails;
  setOrbitDetailsWin?: (string, boolean) => void;
  currentDate: DateTime;
  setNewDate: Function;
  buttons: ReactNode[];
  allowPrepend?: boolean;
  onAppend?: Function;
  onPrepend?: Function;
}

const VisControls: React.FC<VisControlsProps> = ({
  buttons,
  orbitDetails,
  setOrbitDetailsWin,
  setNewDate,
  currentDate,
  allowPrepend = false,
}) => {
  const dateIndex = currentDate.toISODate();
  // TODO: hook up to new state
  const currentDayStatus = false; //!!(orbitDetails?.wins?.[dateIndex]);
  return (
    <div className="vis-controls">
      {allowPrepend && (
        <button className="add-node-button higher-button"></button>
      )}
      <Calendar
        currentDate={currentDate}
        setNewDate={setNewDate}
        orbitWins={{} as any} // TODO: see above
        mainCheckbox={
          <div className="tickbox-container">
            <TickBox
              completed={currentDayStatus}
              toggleIsCompleted={() => {
                setOrbitDetailsWin?.(dateIndex, !currentDayStatus);
              }}
              size="main"
              id={""}
            />
            {...buttons}
          </div>
        }
      ></Calendar>
      {allowPrepend && (
        <button className="add-node-button lower-button"></button>
      )}
    </div>
  );
};

export default VisControls;
