import { atom } from "jotai";
import { appStateAtom } from "./store";
import { ActionHashB64 } from "@holochain/client";
import { WinDataPerOrbitNode } from "./types";

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
