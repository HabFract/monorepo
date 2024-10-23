import { atom } from "jotai";
import { appStateAtom } from "./store";
import { ActionHashB64 } from "@holochain/client";
import { OrbitNodeDetails, WinData } from "./types";

export const setWinRecordAtom = atom(
  null,
  (
    get,
    set,
    {
      orbitHash,
      date,
      winData,
    }: { orbitHash: ActionHashB64; date: string; winData: boolean }
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
 * Atom for managing win data for a specific orbit.
 * Allows both setting and getting win data.
 *
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the win data for the orbit
 */
export const winRecordForOrbitAtom = (orbitHash: ActionHashB64) => {
  return atom<
    WinData<OrbitNodeDetails["frequency"]> | null,
    { date: string; winData: boolean },
    void
  >(
    (get) => {
      const state = get(appStateAtom);
      return state.wins[orbitHash] || null;
    },
    (get, set, { date, winData }) => {
      const state = get(appStateAtom);
      const currentWinData = state.wins[orbitHash] || {};

      set(appStateAtom, {
        ...state,
        wins: {
          ...state.wins,
          [orbitHash]: {
            ...currentWinData,
            [date]: winData,
          },
        },
      });
    }
  );
};
