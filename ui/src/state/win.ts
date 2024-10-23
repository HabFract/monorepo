import { atom } from "jotai";
import { appStateAtom } from "./store";
import { ActionHashB64 } from "@holochain/client";

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

export const getWinDataForOrbitAtom = (orbitHash: ActionHashB64) => {
  return atom((get) => {
    const state = get(appStateAtom);
    return state.wins[orbitHash] || null;
  });
};
