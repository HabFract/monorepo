import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import "./common.css";
import VisMovementLateral, { VisMovementLateralProps } from "./VisMovementLateral";
import WinCount, { WinCountProps } from "./WinCount";
import StreakCount, { StreakCountProps } from "./StreakCount";
import { VisMovementVerticalProps } from "./VisMovementVertical";
import SwipeUpTab from "./SwipeUpTab";
import Calendar from "./Calendar";
import mockAppState from "../mockState";
import { DateTime } from "luxon";

export type OverlayLayoutProps = VisMovementLateralProps & VisMovementVerticalProps & WinCountProps & StreakCountProps;

const OverlayLayout: React.FC<OverlayLayoutProps> = ({
  currentStreak,
  handleSaveWins,
  orbitFrequency,
  orbits,
  currentWins
}): ReactNode => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const padding = -8; // TODO: add conditional based on calendar height.
  const calendarTitleHeightWithPadding = useMemo(() => calendarRef?.current?.firstElementChild?.offsetHeight + padding, [calendarHeight]);
  useEffect(() => {
    if (calendarRef.current) {
      setCalendarHeight(calendarRef.current.offsetHeight);
    }
  }, []);
  console.log('calendarHeight :>> ', calendarHeight);
  return (
    <section className={"overlay-layout-container"}>
      <SwipeUpTab verticalOffset={calendarHeight - calendarTitleHeightWithPadding}>
        <div className="overlay-controls-container">
          <VisMovementLateral orbits={orbits} ></VisMovementLateral>
          {/* <VisMovementLateral></VisMovementLateral> */}
          <div className="overlay-win-streak-container flex gap-2 justify-between">
            <WinCount handleSaveWins={handleSaveWins} currentWins={currentWins} orbitFrequency={orbitFrequency}></WinCount>
            <StreakCount currentStreak={currentStreak} orbitFrequency={orbitFrequency}></StreakCount>
          </div>
        </div>
        <nav ref={calendarRef} className="text-white bg-menu-bg">
          <Calendar currentDate={DateTime.now()} setNewDate={() => { }} orbitWins={mockAppState.wins['uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc']}></Calendar>
        </nav>
      </SwipeUpTab>
    </section>
  );
};

export default OverlayLayout;