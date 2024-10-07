import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import "./common.css";
import VisMovementLateral, { VisMovementLateralProps } from "./VisMovementLateral";
import WinCount, { WinCountProps } from "./WinCount";
import StreakCount, { StreakCountProps } from "./StreakCount";
import { VisMovementVerticalProps } from "./VisMovementVertical";
import SwipeUpTab, { handlePointerDown, handlePointerMove, handlePointerUp, stopPropagation } from "./SwipeUpTab";
import Calendar from "./Calendar";
import mockAppState from "../mockState";
import { DateTime } from "luxon";
import { motion } from "framer-motion";

export type OverlayLayoutProps = VisMovementLateralProps & VisMovementVerticalProps & WinCountProps & StreakCountProps & {
  setNewDate: Function,
  currentDate: DateTime
};

const OverlayLayout: React.FC<OverlayLayoutProps> = ({
  currentStreak,
  currentDate,
  handleSaveWins,
  setNewDate,
  orbitFrequency,
  orbits,
  currentWins
}): ReactNode => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const padding = document.body.getBoundingClientRect().width < 340 ? -30 : (document.body.getBoundingClientRect().width < 520 ? -68 : -100);
  const calendarHeightWithPadding = useMemo(() => calendarRef?.current?.firstElementChild?.offsetHeight + padding, [calendarHeight]);

  useEffect(() => {
    if (calendarRef.current) {
      setCalendarHeight(calendarRef.current.offsetHeight);
    }
  }, []);

  return (
    <section className={"overlay-layout-container"}>
      <SwipeUpTab verticalOffset={calendarHeightWithPadding}>
        {({ bindDrag }) => (
          <>
            <div className="overlay-controls-container">
              <span
              
              onPointerDownCapture={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}>
                <VisMovementLateral orbits={orbits}></VisMovementLateral>
              </span>
              {/* <VisMovementLateral></VisMovementLateral> */}
              <div className="overlay-win-streak-container flex gap-2 justify-between" onPointerDownCapture={stopPropagation}>
                <WinCount handleSaveWins={handleSaveWins} currentWins={currentWins} orbitFrequency={orbitFrequency}></WinCount>
                <StreakCount currentStreak={currentStreak} orbitFrequency={orbitFrequency}></StreakCount>
              </div>
            </div>
            <motion.nav ref={calendarRef} className="text-white bg-menu-bg">
              <motion.div className="handle"  {...bindDrag} style={{ touchAction: 'none', cursor: 'grab' }} >
                <span></span>
              </motion.div>
              <span onPointerDownCapture={stopPropagation}>
                <Calendar currentDate={currentDate} setNewDate={setNewDate} orbitWins={mockAppState.wins['uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc']}></Calendar>
              </span>
            </motion.nav>
          </>
        )}
      </SwipeUpTab>
    </section>
  );
};

export default OverlayLayout;