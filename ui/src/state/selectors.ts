import { ActionHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { appStateAtom } from "./store";
import { WinData, WinState } from "./types/win";
import { SphereDetails } from "./types/sphere";
import { Frequency, OrbitNodeDetails, RootOrbitEntryHash } from "./types/orbit";
import { Hierarchy } from "./types/hierarchy";


/**
 * Gets the details of the current Sphere context
 * @returns The current sphere details or null if no sphere is selected
 */
export const currentSphereAtom = atom<SphereDetails | null>((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  return state.spheres.byHash[currentSphereHash]?.details || null;
});

/**
 * Gets the frequency of a given Orbit from the AppState
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the frequency of the orbit, or null if the orbit doesn't exist
 */
export const getOrbitFrequency = (orbitHash: ActionHashB64) => {
  const selectFrequency = atom<Frequency.Rationals | null>((get) => {
    const state = get(appStateAtom);
    const orbit = state.orbitNodes.byHash[orbitHash];
    return orbit?.frequency || null;
  });
  return selectFrequency;
};

/**
 * Gets the win data for a specific orbit
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the win data for the orbit, or an empty object if no data exists
 */
export const orbitWinDataAtom = (orbitHash: ActionHashB64) => {
  const selectWinData = atom<WinData<Frequency.Rationals>>((get) => {
    const state = get(appStateAtom);
    return state.wins[orbitHash] || {};
  });
  return selectWinData;
};

/**
 * Sets a win for a specific orbit on a given date
 * @param orbitHash The ActionHash of the orbit
 * @param date The date for the win
 * @param winIndex The index of the win (for frequencies > 1)
 * @param hasWin Whether the win is achieved or not
 */
export const setWinForOrbit = atom(
  null,
  (get, set, { orbitHash, date, winIndex, hasWin }: { orbitHash: ActionHashB64, date: string, winIndex?: number, hasWin: boolean }) => {
    const state = get(appStateAtom);
    const orbit = state.orbitNodes.byHash[orbitHash];
    
    if (!orbit) {
      console.warn(`Attempted to set win for non-existent orbit: ${orbitHash}`);
      return;
    }

    const frequency = orbit.frequency;
    const currentWinData = state.wins[orbitHash] || {};

    let newWinData: WinData<typeof frequency>;
    if (frequency > 1) {
      const currentDayData = Array.isArray(currentWinData[date]) 
        ? currentWinData[date] as boolean[]
        : new Array(Math.round(frequency)).fill(false);
      const newDayData = [...currentDayData];
      if (winIndex !== undefined && winIndex < Math.round(frequency)) {
        newDayData[winIndex] = hasWin;
      }
      newWinData = { ...currentWinData, [date]: newDayData } as WinData<typeof frequency>;
    } else {
      newWinData = { ...currentWinData, [date]: hasWin } as WinData<typeof frequency>;
    }

    set(appStateAtom, {
      ...state,
      wins: {
        ...state.wins,
        [orbitHash]: newWinData,
      },
    });
  }
);

/**
 * Calculates the overall completion status for a specific orbit
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the completion status (as a percentage), or null if the orbit doesn't exist
 */
export const calculateCompletionStatusAtom = (orbitHash: ActionHashB64) => {
  const calculateCompletionStatus = atom<number | null>((get) => {
    const state = get(appStateAtom);
    const orbit = state.orbitNodes.byHash[orbitHash];
    const winData = state.wins[orbitHash] || {};

    if (!orbit) {
      return null; // Return null for non-existent orbits
    }

    // Implement completion status calculation logic here based on frequency
    // This is a placeholder implementation
    return 0;
  });
  return calculateCompletionStatus;
};

/**
 * Calculates the streak information for a specific orbit
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the streak count, or null if the orbit doesn't exist
 */
export const calculateStreakAtom = (orbitHash: ActionHashB64) => {
  const calculateStreak = atom<number | null>((get) => {
    const state = get(appStateAtom);
    const orbit = state.orbitNodes.byHash[orbitHash];
    const winData = state.wins[orbitHash] || {};

    if (!orbit) {
      return null; // Return null for non-existent orbits
    }

    // Implement streak calculation logic here based on frequency
    // This is a placeholder implementation
    return 0;
  });
  return calculateStreak;
};

/**
 * Gets the hierarchy for a given root orbit entry hash
 * @param rootOrbitEntryHash The EntryHash of the root orbit
 * @returns An atom that resolves to the hierarchy, or null if it doesn't exist
 */
export const getHierarchyAtom = (rootOrbitEntryHash: RootOrbitEntryHash) => {
  const selectHierarchy = atom<Hierarchy | null>((get) => {
    const state = get(appStateAtom);
    return state.hierarchies.byRootOrbitEntryHash[rootOrbitEntryHash] || null;
  });
  return selectHierarchy;
};

/**
 * Gets all orbits for a given hierarchy
 * @param rootOrbitEntryHash The EntryHash of the root orbit
 * @returns An atom that resolves to an array of orbit details
 */
export const getHierarchyOrbitsAtom = (rootOrbitEntryHash: RootOrbitEntryHash) => {
  const selectOrbits = atom<OrbitNodeDetails[]>((get) => {
    const state = get(appStateAtom);
    const hierarchy = state.hierarchies.byRootOrbitEntryHash[rootOrbitEntryHash];
    if (!hierarchy) return [];
    
    return hierarchy.nodeHashes.map(hash => state.orbitNodes.byHash[hash]);
  });
  return selectOrbits;
};