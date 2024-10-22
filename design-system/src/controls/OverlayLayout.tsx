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
import { Frequency, OrbitNodeDetails, WinData } from "@ui/src/state";

export type OverlayLayoutProps = {
  setNewDate: Function,
  currentDate: DateTime,

  currentStreak: number;
  longestStreak?: number;

  currentWins: WinData<Frequency.Rationals> | null;
  orbitFrequency: Frequency.Rationals;

  orbitSiblings: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>
  orbitDescendants: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>

  handlePersistWins: () => void;
  handleUpdateWorkingWins: (newWinCount: number) => void;
  isLeafOrbit: boolean;
  workingWinDataForOrbit: any,
  currentOrbitDetails: OrbitNodeDetails | null,
  actions: any,
};

const OverlayLayout: React.FC<OverlayLayoutProps> = ({
  currentDate,
  setNewDate,
  orbitFrequency,
  orbitDescendants,
  orbitSiblings,
  currentStreak,
  currentWins,
  handlePersistWins,
  handleUpdateWorkingWins,
  workingWinDataForOrbit,
  isLeafOrbit,
  currentOrbitDetails,
  actions,
}): ReactNode => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const padding = document.body.getBoundingClientRect().width < 340 ? -30 : (document.body.getBoundingClientRect().width < 520 ? -88 : -100);
  const calendarHeightWithPadding = useMemo(() => (calendarRef?.current?.firstElementChild as any)?.offsetHeight + padding, [calendarHeight]);

  const [wins, setWins] = useState<number | null>(null);

  const currentDateWins = useMemo(() => {
    if (!workingWinDataForOrbit || !currentDate) return null;
    const dateString = currentDate.toLocaleString();
    const winData = workingWinDataForOrbit[dateString];
    if (typeof winData == 'undefined') return null;
    return Array.isArray(winData) ? winData.filter(Boolean).length : winData ? 1 : 0;
  }, [workingWinDataForOrbit, currentDate, currentOrbitDetails?.eH]);

  const handleSaveWins = () => {
    if (currentWins == null) return;
    handlePersistWins()
  }

  useEffect(() => {
    if (currentDateWins == null) return;
    setWins(currentDateWins);
  }, [currentDateWins]);

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
                <WinCount currentDate={currentDate} handleUpdateWorkingWins={handleUpdateWorkingWins} handleSaveWins={handleSaveWins} currentWins={wins} orbitFrequency={orbitFrequency}></WinCount>
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