import { ActionHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { appStateAtom } from "./store";
import { WinData, WinState } from "./types/win";
import SphereState, { SphereEntry } from "./types/sphere";
import { Frequency } from "./types/orbit";

/**
 * Gets the details of the current Sphere context
 * @returns The current sphere details or null if no sphere is selected
 */
export const currentSphereAtom = atom((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  return state.spheres.spheres[currentSphereHash] || null;
});

/**
 * Gets the frequency of a given Orbit from the AppState
 * @param nodeId The ID of the orbit node
 * @returns An atom that resolves to the frequency of the orbit, or null if the orbit doesn't exist
 */
export const getOrbitFrequency = (nodeId: ActionHashB64) => {
  const selectFrequency = atom((get) => {
    const state = get(appStateAtom);
    const sphere = Object.values(state.spheres.spheres).find(sphere => 
      Object.values(sphere.hierarchies).some(hierarchy => 
        hierarchy.nodes[nodeId]
      )
    );
    const node = sphere && Object.values(sphere.hierarchies).flatMap(h => Object.values(h.nodes)).find(n => n.id === nodeId);
    return node?.frequency || null;
  });
  return selectFrequency;
};

/**
 * Gets the win data for a specific node
 * @param nodeId The ID of the orbit node
 * @returns An atom that resolves to the win data for the node, or an empty object if no data exists
 */
export const nodeWinDataAtom = (nodeId: ActionHashB64) => {
  const selectWinData = atom((get) => {
    const state = get(appStateAtom);
    return state.wins[nodeId] || {};
  });
  return selectWinData;
};

/**
 * Sets a win for a specific node on a given date
 * @param nodeId The ID of the orbit node
 * @param date The date for the win
 * @param winIndex The index of the win (for frequencies > 1)
 * @param hasWin Whether the win is achieved or not
 */
export const setWinForNode = atom(
  null,
  (get, set, { nodeId, date, winIndex, hasWin }: { nodeId: ActionHashB64, date: string, winIndex?: number, hasWin: boolean }) => {
    const state = get(appStateAtom);
    const frequency = get(getOrbitFrequency(nodeId));
    const currentWinData = state.wins[nodeId] || {};

    if (frequency === null) {
      console.warn(`Attempted to set win for non-existent orbit: ${nodeId}`);
      return;
    }

    let newWinData;
    if (frequency > 1) {
      const currentDayData = Array.isArray(currentWinData[date]) 
        ? currentWinData[date] as boolean[]
        : new Array(Math.round(frequency)).fill(false);
      const newDayData = [...currentDayData];
      if (winIndex !== undefined && winIndex < Math.round(frequency)) {
        newDayData[winIndex] = hasWin;
      }
      newWinData = { ...currentWinData, [date]: newDayData };
    } else {
      newWinData = { ...currentWinData, [date]: hasWin };
    }

    set(appStateAtom, {
      ...state,
      wins: {
        ...state.wins,
        [nodeId]: newWinData,
      },
    });
  }
);

/**
 * Calculates the overall completion status for a specific node
 * @param nodeId The ID of the orbit node
 * @returns An atom that resolves to the completion status (as a percentage), or null if the orbit doesn't exist
 */
export const calculateCompletionStatusAtom = (nodeId: ActionHashB64) => {
  const calculateCompletionStatus = atom((get) => {
    const winData = get(nodeWinDataAtom(nodeId));
    const frequency = get(getOrbitFrequency(nodeId));

    if (frequency === null) {
      return null; // Return null for non-existent orbits
    }

    // Implement completion status calculation logic here based on frequency
    // This is a placeholder implementation
    return 0;
  });
  return calculateCompletionStatus;
};

/**
 * Calculates the streak information for a specific node
 * @param nodeId The ID of the orbit node
 * @returns An atom that resolves to the streak count, or null if the orbit doesn't exist
 */
export const calculateStreakAtom = (nodeId: ActionHashB64) => {
  const calculateStreak = atom((get) => {
    const winData = get(nodeWinDataAtom(nodeId));
    const frequency = get(getOrbitFrequency(nodeId));

    if (frequency === null) {
      return null; // Return null for non-existent orbits
    }

    // Implement streak calculation logic here based on frequency
    // This is a placeholder implementation
    return 0;
  });
  return calculateStreak;
};