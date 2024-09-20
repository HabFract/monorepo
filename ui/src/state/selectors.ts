import { ActionHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { Frequency } from "./types/orbit";
import { appStateAtom } from "./store";
import { WinState } from "./types/win";
import SphereState, { SphereEntry } from "./types/sphere";

/**
 * Gets the SphereDetails of the current Sphere context
 */
export const currentSphereAtom = atom(
  (get) => {
    const state = get(appStateAtom);
    const currentSphereHash = state.spheres.currentSphereHash;
    return state.spheres.spheres[currentSphereHash];
  }
);

// Derived atom for accessing win data for a specific node
export const nodeWinDataAtom = (nodeId: ActionHashB64) => atom(
  (get) => {
    return (get(appStateAtom).wins[nodeId] || {}) as WinState[typeof nodeId];
  }
);

// Helper function to get orbit frequency
const getOrbitFrequency = (get: any, nodeId: ActionHashB64): Frequency.Rationals => {
  const state = get(appStateAtom);
  const sphere = Object.values(state.spheres.spheres).find(sphere => 
    !!sphere && Object.values((sphere as SphereEntry).hierarchies).some(hierarchy => 
      hierarchy.nodes[nodeId]
    )
  );

  const node = !!sphere && Object.values(sphere.hierarchies).flatMap(h => Object.values(h.nodes)).find(n => n.id === nodeId);
  return node?.frequency || Frequency.DAILY_OR_MORE.DAILY;
};


// Utility function to set a win for a specific node and date
export const setWinForNode = atom(
  null,
  (get, set, { nodeId, date, winIndex, hasWin }: { nodeId: ActionHashB64, date: string, winIndex?: number, hasWin: boolean }) => {
    const state = get(appStateAtom);
    const frequency = getOrbitFrequency(get, nodeId);
    const currentWinData = state.wins[nodeId] || {};

    let newDayData: boolean | boolean[];
    if (frequency > 1) {
      const currentDayData = Array.isArray(currentWinData[date]) 
        ? currentWinData[date] as boolean[]
        : new Array(Math.round(frequency)).fill(false);
      newDayData = [...currentDayData];
      if (winIndex !== undefined && winIndex < Math.round(frequency)) {
        newDayData[winIndex] = hasWin;
      }
    } else {
      newDayData = hasWin;
    }

    set(appStateAtom, {
      ...state,
      wins: {
        ...state.wins,
        [nodeId]: {
          ...currentWinData,
          [date]: newDayData,
        },
      },
    });
  }
);

// Helper function to count wins for a specific period
const countWinsForPeriod = (winData: WinState[ActionHashB64], startDate: string, endDate: string): number => {
  let totalWins = 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split('T')[0];
    const dayWins = winData[dateString];
    
    if (Array.isArray(dayWins)) {
      totalWins += dayWins.filter(Boolean).length;
    } else if (dayWins) {
      totalWins += 1;
    }
  }

  return totalWins;
};

// Placeholder for calculating streak information
export const calculateStreakAtom = (nodeId: ActionHashB64) => atom(
  (get) => {
    const winData = get(nodeWinDataAtom(nodeId));
    const frequency = getOrbitFrequency(get, nodeId);
    // Implement streak calculation logic here based on frequency
    return 0; // Placeholder return value
  }
);

// Placeholder for calculating overall completion status
export const calculateCompletionStatusAtom = (nodeId: ActionHashB64) => atom(
  (get) => {
    const winData = get(nodeWinDataAtom(nodeId));
    const frequency = getOrbitFrequency(get, nodeId);
    // Implement completion status calculation logic here based on frequency
    return 0; // Placeholder return value (e.g., percentage complete)
  }
);