import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import "./common.css";
import VisMovementLateral from "./VisMovementLateral";
import WinCount from "./WinCount";
import StreakCount from "./StreakCount";
import VisMovementVertical from "./VisMovementVertical";
import SwipeUpTab, { stopPropagation } from "./SwipeUpTab";
import Calendar from "./Calendar";
import mockAppState from "../mockState";
import { DateTime } from "luxon";
import { motion } from "framer-motion";
import { Scale } from "../generated-types";
import { FixedLengthArray, Frequency, WinData } from "@ui/src/state";
import { toYearDotMonth } from ".";

export type OverlayLayoutProps = {
  setNewDate: Function,
  currentDate: DateTime,

  currentStreak: number;
  longestStreak?: number;

  currentWins: WinData<Frequency.Rationals> | null;
  persistWins: () => void;
  orbitFrequency: Frequency.Rationals;

  orbitSiblings: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>
  orbitDescendants: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>
  actions: any,
};

const OverlayLayout: React.FC<OverlayLayoutProps> = ({
  currentStreak,
  currentDate,
  setNewDate,
  orbitFrequency,
  currentWins,
  persistWins,
  actions,
  orbitDescendants,
  orbitSiblings,
}): ReactNode => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const padding = document.body.getBoundingClientRect().width < 340 ? -30 : (document.body.getBoundingClientRect().width < 520 ? -88 : -100);
  const calendarHeightWithPadding = useMemo(() => (calendarRef?.current?.firstElementChild as any)?.offsetHeight + padding, [calendarHeight]);

  const currentYearDotMonth = toYearDotMonth(currentDate.toLocaleString());
  const [wins, setWins] = useState<number>();

  const currentDateWins = useMemo((): number | null => {
    if (!currentWins || !currentDate) return null;

    const currentDateWinData = currentWins[currentYearDotMonth];
    // Count wins depending on frequency and hence type of WinData
    const wins = orbitFrequency > 1
      ? (currentDateWinData as FixedLengthArray<boolean, typeof orbitFrequency>).filter(win => win).length
      : +(currentDateWinData as boolean)
    return wins
  }, [currentDate, currentWins])

  const handleSaveWins = () => {
    if (currentWins == null) return;
    console.log(currentWins[currentYearDotMonth])
    persistWins()
  }
  const handleUpdateWorkingWins = (newWinCount: number) => {
    if (currentWins == null) return;
    currentWins[currentYearDotMonth] = orbitFrequency > 1
      ? Array.apply(null, Array(5)).map((_, i) => i < newWinCount - 1)
      : !!newWinCount as any
  }

  useEffect(() => {
    if (!currentDateWins) return;
    setWins(currentDateWins);
  }, [currentDate, currentWins]);

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
              <span>
                <VisMovementLateral orbitSiblings={orbitSiblings} moveLeftAction={actions.moveLeft} moveRightAction={actions.moveRight}></VisMovementLateral>
                <VisMovementVertical orbitDescendants={orbitDescendants} moveUpAction={actions.moveUp} moveDownAction={actions.moveDown}></VisMovementVertical>
                <div className="center-marker"></div>
              </span>
              <div className="overlay-win-streak-container" onPointerDownCapture={stopPropagation}>
                <WinCount handleUpdateWorkingWins={handleUpdateWorkingWins} handleSaveWins={handleSaveWins} currentWins={currentDateWins} orbitFrequency={orbitFrequency}></WinCount>
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