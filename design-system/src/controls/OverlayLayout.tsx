import { ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import "./common.css";
import VisMovementLateral from "./VisMovementLateral";
import WinCount from "./WinCount";
import StreakCount from "./StreakCount";
import VisMovementVertical from "./VisMovementVertical";
import SwipeUpTab from "./SwipeUpTab";
import { stopPropagation } from "./swipe-tab-utils";
import Calendar from "./Calendar";
import { DateTime } from "luxon";
import { motion } from "framer-motion";
import { ConsolidatedActions, Frequency, OrbitDescendant, OrbitNodeDetails, WinData, WinDataPerOrbitNode } from "@ui/src/state";
import { SetAtom } from "@ui/src/state/types/store";

export type OverlayLayoutProps = {
  setNewDate: SetAtom<[SetStateAction<DateTime<true>>], void>,
  currentDate: DateTime,

  currentStreak: number;
  longestStreak: number;

  orbitFrequency: Frequency.Rationals;

  orbitSiblings: Array<OrbitDescendant>
  orbitDescendants: Array<OrbitDescendant>

  handlePersistWins: () => void;
  handleUpdateWorkingWins: (newWinCount: number) => void;
  isLeafOrbit: boolean;
  workingWinDataForOrbit: WinData<Frequency.Rationals> | null,
  currentOrbitDetails: OrbitNodeDetails | null,
  actions: ConsolidatedActions,
};

const OverlayLayout: React.FC<OverlayLayoutProps> = ({
  currentDate,
  setNewDate,
  orbitFrequency,
  orbitDescendants,
  orbitSiblings,
  currentStreak,
  longestStreak,
  handlePersistWins,
  handleUpdateWorkingWins,
  workingWinDataForOrbit,
  isLeafOrbit,
  currentOrbitDetails,
  actions,
}): ReactNode => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [wins, setWins] = useState<number | null>(null);

  const currentDateWins = useMemo(() => {
    if (!workingWinDataForOrbit || !currentDate) return null;
    const dateString = currentDate.toLocaleString();
    const winData = workingWinDataForOrbit[dateString];
    setWins(winData == null ? 0 :
      Array.isArray(winData) ? winData.filter(Boolean).length :
        winData ? 1 : 0);
    return winData == null ? 0 :
      Array.isArray(winData) ? winData.filter(Boolean).length :
        winData ? 1 : 0;

  }, [workingWinDataForOrbit, currentDate]);

  const handleSaveWins = () => {
    if (workingWinDataForOrbit == null) return;
    handlePersistWins()
  }

  useEffect(() => {
    setWins(currentDateWins);
  }, [currentDateWins, workingWinDataForOrbit]);

  return (
    <section className="overlay-layout-container">
      <SwipeUpTab relativeElements={<span className="vis-controls-container">
        <VisMovementLateral currentOrbitDetails={currentOrbitDetails} orbitSiblings={orbitSiblings} goLeftAction={actions.goLeft} goRightAction={actions.goRight}></VisMovementLateral>
        <VisMovementVertical currentOrbitDetails={currentOrbitDetails} orbitDescendants={orbitDescendants} moveUpAction={actions.goUp} moveDownAction={actions.goDown}></VisMovementVertical>
        <div className="center-marker"></div>
      </span>} verticalOffset={48}>
        {({ bindDrag }) => (
          <>
            <div className="overlay-controls-container">
              <div className="overlay-win-streak-container" onPointerDownCapture={stopPropagation}>
                <WinCount currentDate={currentDate} handleUpdateWorkingWins={handleUpdateWorkingWins} handleSaveWins={handleSaveWins} currentWins={isLeafOrbit ? wins : -1} orbitFrequency={isLeafOrbit ? orbitFrequency : 0}></WinCount>
                <StreakCount currentStreak={currentStreak} longestStreak={longestStreak} orbitFrequency={orbitFrequency}></StreakCount>
              </div>
            </div>
            <motion.nav ref={calendarRef} className="calendar-nav">
              <motion.div className="handle" {...bindDrag} style={{ touchAction: 'none', cursor: 'grab' }} >
                <span></span>
              </motion.div>
              <span onPointerDownCapture={stopPropagation}>
                <Calendar currentDate={currentDate} orbitFrequency={orbitFrequency} setNewDate={setNewDate} orbitWins={workingWinDataForOrbit || {}}></Calendar>
              </span>
            </motion.nav>
          </>
        )}
      </SwipeUpTab>

    </section>
  );
};

export default OverlayLayout;