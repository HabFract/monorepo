import { memo, ReactNode, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  numberOfLeafOrbitDescendants: number | null
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
  numberOfLeafOrbitDescendants,
  isLeafOrbit,
  currentOrbitDetails,
  actions,
}): ReactNode => {
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Single memoized calculation for wins
  const currentDateWins = useMemo(() => {
    if (!workingWinDataForOrbit || !currentDate) return 0;
    const dateString = currentDate.toLocaleString();
    const winData = workingWinDataForOrbit[dateString];
    return winData == null ? 0 :
      Array.isArray(winData) ? winData.filter(Boolean).length :
        winData ? 1 : 0;
  }, [workingWinDataForOrbit, currentDate.toLocaleString()]);

  const handleSaveWins = useCallback(() => {
    if (workingWinDataForOrbit == null) return;
    handlePersistWins();
  }, [workingWinDataForOrbit, handlePersistWins]);

  return (
    <section className="overlay-layout-container">
      <SwipeUpTab 
        relativeElements={
          <span className="vis-controls-container">
            <VisMovementLateral 
              currentOrbitDetails={currentOrbitDetails} 
              orbitSiblings={orbitSiblings} 
              goLeftAction={actions.goLeft} 
              goRightAction={actions.goRight}
            />
            <VisMovementVertical 
              currentOrbitDetails={currentOrbitDetails} 
              orbitDescendants={orbitDescendants} 
              moveUpAction={actions.goUp} 
              moveDownAction={actions.goDown}
            />
            <div className="center-marker" />
          </span>
        } 
        verticalOffset={48}
      >
        {({ bindDrag }) => (
          <>
            <div className="overlay-controls-container">
              <div className="overlay-win-streak-container" onPointerDownCapture={stopPropagation}>
                <WinCount 
                  isLeafOrbit={isLeafOrbit}
                  currentDate={currentDate}
                  handleUpdateWorkingWins={handleUpdateWorkingWins}
                  handleSaveWins={handleSaveWins}
                  currentWins={currentDateWins}
                  orbitFrequency={(isLeafOrbit ? orbitFrequency : numberOfLeafOrbitDescendants) as any}
                />
                <StreakCount 
                  currentStreak={currentStreak}
                  longestStreak={longestStreak}
                  orbitFrequency={orbitFrequency}
                />
              </div>
            </div>
            <motion.nav ref={calendarRef} className="calendar-nav">
              <motion.div 
                className="handle" 
                {...bindDrag} 
                style={{ touchAction: 'none', cursor: 'grab' }}
              >
                <span />
              </motion.div>
              <span onPointerDownCapture={stopPropagation}>
                <Calendar 
                  currentDate={currentDate}
                  orbitFrequency={!workingWinDataForOrbit.useRootFrequency ? numberOfLeafOrbitDescendants : orbitFrequency}
                  setNewDate={setNewDate}
                  orbitWins={workingWinDataForOrbit || {}}
                />
              </span>
            </motion.nav>
          </>
        )}
      </SwipeUpTab>
    </section>
  );
};

export default memo(OverlayLayout);