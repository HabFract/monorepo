import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import "./common.css";
import VisMovementLateral, { VisMovementLateralProps } from "./VisMovementLateral";
import WinCount, { WinCountProps } from "./WinCount";
import StreakCount, { StreakCountProps } from "./StreakCount";
import VisMovementVertical, { VisMovementVerticalProps } from "./VisMovementVertical";
import SwipeUpTab, { stopPropagation } from "./SwipeUpTab";
import Calendar from "./Calendar";
import mockAppState from "../mockState";
import { DateTime } from "luxon";
import { motion } from "framer-motion";

export type OverlayLayoutProps = VisMovementLateralProps & VisMovementVerticalProps & WinCountProps & StreakCountProps & {
  setNewDate: Function,
  currentDate: DateTime,
  actions: any,
};

const OverlayLayout: React.FC<OverlayLayoutProps> = ({
  currentStreak,
  currentDate,
  handleSaveWins,
  setNewDate,
  orbitFrequency,
  currentWins,
  actions,
  orbitDescendants,
  orbitSiblings,
}): ReactNode => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const padding = document.body.getBoundingClientRect().width < 340 ? -30 : (document.body.getBoundingClientRect().width < 520 ? -88 : -100);
  const calendarHeightWithPadding = useMemo(() => (calendarRef?.current?.firstElementChild as any)?.offsetHeight + padding, [calendarHeight]);

  useEffect(() => {
    if (calendarRef.current) {
      setCalendarHeight(calendarRef.current.offsetHeight);
    }
  }, []);

  return (
    <section className="overlay-layout-container">
      <SwipeUpTab verticalOffset={calendarHeightWithPadding}>
        {({ bindDrag }) => (
          <>
            <div className="overlay-controls-container">
              <motion.span>
                <VisMovementLateral orbitSiblings={orbitSiblings} moveLeftAction={actions.moveLeft} moveRightAction={actions.moveRight}></VisMovementLateral>
                <VisMovementVertical orbitDescendants={orbitDescendants} moveUpAction={actions.moveUp} moveDownAction={actions.moveDown}></VisMovementVertical>
                <div className="center-marker"></div>
              </motion.span>
              {/* <VisMovementLateral></VisMovementLateral> */}
              <div className="overlay-win-streak-container" onPointerDownCapture={stopPropagation}>
                <WinCount handleSaveWins={handleSaveWins} currentWins={currentWins} orbitFrequency={orbitFrequency}></WinCount>
                <StreakCount currentStreak={currentStreak} orbitFrequency={orbitFrequency}></StreakCount>
              </div>
            </div>
            <motion.nav ref={calendarRef} className="calendar-nav">
              <motion.div className="handle" {...bindDrag} style={{ touchAction: 'none', cursor: 'grab' }} >
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