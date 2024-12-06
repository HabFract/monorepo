import { atom } from "jotai";
import { appStateAtom } from "./store";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { FixedLengthArray, OrbitNodeDetails, WinDataPerOrbitNode } from "./types";
import {
  getOrbitEhFromId,
  getOrbitNodeDetailsFromEhAtom,
  getOrbitNodeDetailsFromIdAtom,
} from "./orbit";
import { getDescendantLeafNodesAtom, isLeafNodeHashAtom } from "./hierarchy";
import { DateTime } from "luxon";

/**
 * Atom for setting an individual WinData point for a specific orbit.
 *
 * @param params {orbitHash: ActionHash, date: string, winData: WinData}
 * @returns An atom that sets win data for the orbit for a particular date
 */
export const setWinDataAtom = atom(
  null,
  (
    get,
    set,
    {
      orbitHash,
      date,
      winData,
    }: { orbitHash: ActionHashB64; date: string; winData: boolean | boolean[] }
  ) => {
    const state = get(appStateAtom);
    const currentWinData = state.wins[orbitHash] || {};

    set(appStateAtom, {
      ...state,
      wins: {
        ...state.wins,
        [orbitHash]: {
          ...currentWinData,
          [date]: winData as any,
        },
      },
    });
  }
);

/**
 * Atom for managing WinData for a specific orbit node.
 * Allows both setting and getting.
 *
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that sets or gets WinRecord for the orbit
 */
export const winDataPerOrbitNodeAtom = (orbitHash: ActionHashB64) => {
  return atom(
    (get) => {
      const state = get(appStateAtom);
      return state.wins[orbitHash] || null;
    },
    (get, set, winRecord: WinDataPerOrbitNode) => {
      const state = get(appStateAtom);
      set(appStateAtom, {
        ...state,
        wins: {
          ...state.wins,
          [orbitHash]: winRecord,
        } as any,
      });
    }
  );
};

/**
 * Determines if a win record contains a completed win for a particular date.
 * @param orbitEh The EntryHashB64 of the orbit
 * @param date The date to check for completion, formatted as a locale string
 * @returns An atom that resolves to a boolean indicating completion
 */
export const getWinCompletionForOrbitForDayAtom = (
  orbitEh: EntryHashB64,
  date: string
) => {
  return atom((get) => {
    const state = get(appStateAtom);
    let hash = orbitEh;
    // Failsafe in case action hash was stored instead of entry hash
    if (!hash.startsWith("uhCE")) {
      const eH = get(getOrbitEhFromId(orbitEh));
      if (!eH) return null;
      hash = eH;
    }
    const orbit: OrbitNodeDetails | null = get(
      getOrbitNodeDetailsFromEhAtom(hash)
    );
    const winData = state.wins[hash] || {};

    if (!orbit) return false;

    const winDataForDay = winData[date];
    const orbitFrequency = orbit.frequency;

    const isCompleted =
      orbitFrequency > 1
        ? (winDataForDay as Array<boolean>)?.every((val: boolean) => val)
        : typeof winDataForDay === "undefined"
          ? false
          : winDataForDay;

    return isCompleted;
  });
};

/**
 * Calculates the overall completion status for a specific orbit
 * @param orbitHash The EntryHashB64 of the orbit
 * @param date The date to check completion for
 * @returns An atom that resolves to a boolean indicating if the orbit is complete
 */
export const calculateCompletionStatusAtom = (
  orbitEh: EntryHashB64,
  date: string
) => {
  return atom((get) => {
    const orbit: OrbitNodeDetails | null = get(
      getOrbitNodeDetailsFromEhAtom(orbitEh)
    );

    if (!orbit) return null;

    // Check if it's a leaf node
    const isLeaf = get(isLeafNodeHashAtom(orbit.id));

    if (isLeaf) {
      // Use direct win completion logic for leaf nodes
      return get(getWinCompletionForOrbitForDayAtom(orbitEh, date));
    } else {
      // For non-leaf nodes, check all descendant leaf nodes
      const leafDescendants = get(getDescendantLeafNodesAtom(orbitEh));

      if (!leafDescendants) return null;
      // Check completion status of all leaf descendants
      return leafDescendants.flat().every((leaf) => {
        return get(getWinCompletionForOrbitForDayAtom(leaf.content, date));
      });
    }
  });
};

/**
 * Calculates win data for non-leaf nodes based on their descendants' completion status.
 * 
 * @param {EntryHashB64} orbitEh - The entry hash of the orbit node
 * @returns {Atom<WinDataPerOrbitNode | null>} An atom containing the calculated win data or null if orbit doesn't exist
 * 
 * @description
 * This atom calculates win data for non-leaf nodes by checking the completion status
 * of all leaf descendants for each day in the current month. A day is considered complete
 * only if all leaf descendants are complete for that day.
 */
export const calculateWinDataForNonLeafNodeAtom = (orbitEh: EntryHashB64) => {
  return atom((get) => {
    console.log('Starting calculation for:', orbitEh);
    
    const orbit = get(getOrbitNodeDetailsFromEhAtom(orbitEh));
    console.log('Got orbit details:', {
      orbitEh,
      orbit,
      exists: !!orbit
    });
    
    if (!orbit) {
      console.warn('No orbit found for:', orbitEh);
      return null;
    }

    const leafDescendants = get(getDescendantLeafNodesAtom(orbitEh));
    console.log('Got leaf descendants:', {
      orbitEh,
      leafDescendants,
      count: leafDescendants?.length,
      exists: !!leafDescendants
    });
    
    if (!leafDescendants) {
      console.warn('No leaf descendants found for:', orbitEh);
      return null;
    }

    const today = DateTime.now();
    const startOfMonth = today.startOf('month');
    const endOfMonth = today.endOf('month');
    
    const winData = {};
    let currentDate = startOfMonth;
    
    console.log('Calculating for date range:', {
      start: startOfMonth.toLocaleString(),
      end: endOfMonth.toLocaleString()
    });

    while (currentDate <= endOfMonth) {
      const dateString = currentDate.toLocaleString();

      const isComplete = leafDescendants.every((leaf) => {
        return get(calculateCompletionStatusAtom(leaf.content, dateString));
      });

      if (orbit.frequency > 1) {
        winData[dateString] = Array(orbit.frequency).fill(isComplete);
      } else {
        winData[dateString] = isComplete;
      }
      
      currentDate = currentDate.plus({ days: 1 });
    }

    console.log('Final calculated win data:', {
      orbitEh,
      winData
    });

    return winData;
  });
};

/**
 * Gets the appropriate win data for an orbit based on whether it's a leaf or non-leaf node.
 * 
 * @param {EntryHashB64} orbitEh - The entry hash of the orbit node
 * @returns {Atom<WinDataPerOrbitNode | null>} An atom containing either actual win data for leaf nodes
 * or calculated win data for non-leaf nodes
 * 
 * @description
 * This utility atom determines whether an orbit is a leaf node and returns the appropriate
 * win data. For leaf nodes, it returns the actual stored win data. For non-leaf nodes,
 * it returns calculated win data based on the completion status of all descendants.
 */
export const getWinDataForOrbitAtom = (orbitEh: EntryHashB64) => {
  return atom((get) => {
    const orbit = get(getOrbitNodeDetailsFromEhAtom(orbitEh));
    if (!orbit) return null;

    const isLeaf = get(isLeafNodeHashAtom(orbit.id));
    
    if (isLeaf) {
      const state = get(appStateAtom);
      return state.wins[orbit.id] || null;
    } else {
      return get(calculateWinDataForNonLeafNodeAtom(orbitEh));
    }
  });
};

/**
 * Calculates the current streak for a specific orbit (either through wins - leaf nodes - or through derived win completion - nonleaf nodes)
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the streak count, or null if the orbit doesn't exist
 */
export const calculateCurrentStreakAtom = (orbitHash: ActionHashB64) => {
  const orbitDetailsAtom = getOrbitNodeDetailsFromIdAtom(orbitHash);
  const calculateStreak = atom((get) => {
    const orbit = get(orbitDetailsAtom);
    if (!orbit) return null;

    const state = get(appStateAtom);
    const currentDate = DateTime.now().toLocaleString();
    const winData = state.wins[orbit.eH] || {};

    let streak = 0;
    let date = DateTime.fromFormat(currentDate, "dd/MM/yyyy");

    while (true) {
      const dateString = date.toFormat("dd/MM/yyyy");
      const winEntry = winData[dateString];

      if (winEntry === undefined) break;

      if (Array.isArray(winEntry)) {
        if (winEntry.every(Boolean)) {
          streak++;
        } else {
          break;
        }
      } else if (winEntry === true) {
        streak++;
      } else {
        break;
      }

      date = date.minus({ days: 1 });
    }

    return streak;
  });

  return calculateStreak;
};
(calculateCurrentStreakAtom as any).testId = "calculateCurrentStreakAtom";

/**
 * Calculates the longest streak for a specific orbit based on its win data.
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the longest streak count, or null if the orbit doesn't exist
 */
export const calculateLongestStreakAtom = (orbitHash: ActionHashB64) => {
  const calculateLongestStreak = atom<number | null>((get) => {
    const state = get(appStateAtom);
    const orbit = state.orbitNodes.byHash[orbitHash];

    if (!orbit) return null;
    const winData = state.wins[orbit.eH] || {};
    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: DateTime | null = null;

    // Sort the dates using DateTime for correct chronological order
    const sortedDates = Object.keys(winData).sort((a, b) => {
      const dateA = DateTime.fromFormat(a, "dd/MM/yyyy");
      const dateB = DateTime.fromFormat(b, "dd/MM/yyyy");
      return dateA.toMillis() - dateB.toMillis();
    });

    for (const date of sortedDates) {
      const winEntry = winData[date];
      const currentDate = DateTime.fromFormat(date, "dd/MM/yyyy");

      // Check if the current date is consecutive to the previous date
      if (previousDate && currentDate.diff(previousDate, "days").days !== 1) {
        currentStreak = 0; // Reset streak if not consecutive
      }

      if (Array.isArray(winEntry)) {
        if (winEntry.every(Boolean)) {
          currentStreak++;
        } else {
          currentStreak = 0;
        }
      } else if (winEntry === true) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      previousDate = currentDate; // Update the previous date
    }

    return longestStreak;
  });

  return calculateLongestStreak;
};
(calculateLongestStreakAtom as any).testId = "calculateLongestStreakAtom";
