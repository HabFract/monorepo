import { atom } from "jotai";
import { appStateChangeAtom } from "./store";

export enum SortCriteria {
  Name = "name",
  Scale = "scale",
}

export enum SortOrder {
  GreatestToLowest = "greatestToLowest",
  LowestToGreatest = "lowestToGreatest",
}

export interface SortFilterState {
  sortCriteria: SortCriteria;
  sortOrder: SortOrder;
}

export const listSortFilterAtom = atom<SortFilterState>({
  sortCriteria: SortCriteria.Name,
  sortOrder: SortOrder.LowestToGreatest,
});

// Atom for handedness
export const handednessAtom = atom(
  (get) => get(appStateChangeAtom).ui.handedness,
  (get, set, newHandedness: "left" | "right") => {
    const currentState = get(appStateChangeAtom);
    set(appStateChangeAtom, {
      ...currentState,
      ui: {
        ...currentState.ui,
        handedness: newHandedness,
      },
    });
  }
);

// Atom for performance mode
export const performanceModeAtom = atom(
  (get) => get(appStateChangeAtom).ui.performanceMode,
  (get, set, newPerformanceMode: "snappy" | "fancy" | "snancy") => {
    const currentState = get(appStateChangeAtom);
    set(appStateChangeAtom, {
      ...currentState,
      ui: {
        ...currentState.ui,
        performanceMode: newPerformanceMode,
      },
    });
  }
);
