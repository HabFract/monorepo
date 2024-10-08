// ui/src/hooks/useOverlayLayoutActions.ts
import { useCallback } from "react";
import { DateTime } from "luxon";
import { useSetAtom } from "jotai";
import { currentDayAtom } from "../state/date";
import { setWinForOrbit } from "../state/orbit";
import { useNavigationHelpers } from "./useNavigationHelpers";
import { OrbitNodeDetails } from "../state/types/orbit";
import { IVisualization } from "../components/vis/types";

export function useOverlayLayoutActions(
  currentVis: IVisualization,
  currentOrbit: OrbitNodeDetails
) {
  const setCurrentDate = useSetAtom(currentDayAtom);
  const setWin = useSetAtom(setWinForOrbit);

  const {
    generateNavigationFlags,
    generateNavigationActions,
    createConsolidatedActions,
  } = useNavigationHelpers(currentVis);

  const navigationFlags = generateNavigationFlags({ x: 0, y: 0 }, currentOrbit);
  const baseNavigationActions = generateNavigationActions(currentOrbit);
  const navigationActions = createConsolidatedActions(
    navigationFlags,
    baseNavigationActions
  );

  const handleSaveWins = useCallback(
    (orbitHash: string) =>
      (date: string, winIndex: number | undefined, hasWin: boolean) => {
        setWin({
          orbitHash,
          date,
          winIndex,
          hasWin,
        });
      },
    [setWin]
  );

  return {
    setNewDate: (date: DateTime) => setCurrentDate(date),
    handleSaveWins,
    navigationActions,
  };
}
