import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { appStateAtom } from "./store";
import { SphereOrbitNodes } from "./types/sphere";
import { Frequency, OrbitDetails, OrbitNodeDetails } from "./types/orbit";
import { Orbit, Frequency as Freq } from "../graphql/generated";
import { WinData } from "./types/win";

export const decodeFrequency = (frequency: Freq): Frequency.Rationals => {
  switch (frequency) {
    case Freq.Day:
      return Frequency.DAILY_OR_MORE.DAILY;
    case Freq.Month:
      return Frequency.LESS_THAN_DAILY.MONTHLY;
    case Freq.Quarter:
      return Frequency.LESS_THAN_DAILY.QUARTERLY;
    // case Freq.Year:
    //   return Frequency.LESS_THAN_DAILY.YEARLY;
    default:
      return Frequency.DAILY_OR_MORE.DAILY;
  }
};

/**
 * Transforms from graphQL repsonses into a form expected by state management
 * @returns {OrbitNodeDetails} A record of orbit nodes for the current sphere or null if no sphere is selected
 */
export const mapToCacheObject = (orbit: Orbit): OrbitNodeDetails => {
  const newFrequency = decodeFrequency(orbit.frequency);

  return {
    id: orbit.id,
    eH: orbit.eH,
    parentEh: orbit.parentHash || undefined,
    name: orbit.name,
    scale: orbit.scale,
    sphereHash: orbit.sphereHash,
    frequency: newFrequency,
    description: orbit.metadata?.description || "",
    startTime: orbit.metadata?.timeframe.startTime,
    endTime: orbit.metadata?.timeframe.endTime || undefined,
  };
};

/**
 * Derived atom for current SphereOrbitNodes
 * @returns {SphereOrbitNodes | null} A record of orbit nodes for the current sphere or null if no sphere is selected
 */
export const currentSphereOrbitNodesAtom = atom<SphereOrbitNodes | null>(
  (get) => {
    const state = get(appStateAtom);
    const currentSphereHash = state.spheres.currentSphereHash;
    const currentSphere = state.spheres.byHash[currentSphereHash];
    if (!currentSphere) return null;

    const sphereNodes: SphereOrbitNodes = {};
    Object.entries(state.orbitNodes.byHash).forEach(([nodeHash, orbitNode]) => {
      if (orbitNode.sphereHash === currentSphere.details.entryHash) {
        sphereNodes[nodeHash] = orbitNode;
      }
    });

    return Object.keys(sphereNodes).length > 0 ? sphereNodes : null;
  },
);

/**
 * Derived atom for current OrbitNodeDetails
 * @returns {OrbitNodeDetails | null} Details of the current Orbit's Node
 */
export const currentOrbitDetailsAtom = atom<OrbitNodeDetails | null>((get) => {
  const state = get(appStateAtom);
  const currentOrbitHash = state.orbitNodes.currentOrbitHash;
  if (!currentOrbitHash) return null;

  return state.orbitNodes.byHash[currentOrbitHash] || null;
});

/**
 * Read-write atom for the current orbit ID
 * Reads from and writes to the global app state
 * @returns {{id: ActionHashB64} | null} Details of the current Orbit's Node
 */
export const currentOrbitIdAtom = atom(
  (get) => {
    const state = get(appStateAtom);
    return state.orbitNodes.currentOrbitHash
      ? { id: state.orbitNodes.currentOrbitHash }
      : null;
  },
  (get, set, newOrbitId: ActionHashB64) => {
    set(appStateAtom, (prevState) => ({
      ...prevState,
      orbitNodes: {
        ...prevState.orbitNodes,
        currentOrbitHash: newOrbitId,
      },
    }));
  },
);

/**
 * Atom factory that creates an atom for getting orbit details by ID.
 *
 * @param orbitId - The ActionHashB64 of the orbit to retrieve.
 * @returns An atom that, when read, returns the OrbitNodeDetails for the specified orbitId, or null if not found.
 */
export const getOrbitAtom = (orbitId: ActionHashB64) =>
  atom<OrbitNodeDetails | null>((get) => {
    const state = get(appStateAtom);
    return state.orbitNodes.byHash[orbitId] || null;
  });

/**
 * Selector atom to get the startTime from the appState based on entry hash ( used primarily for sorting a hierarchy)
 * @param orbitEh - The EntryHashB64 of the orbit to retrieve.
 * @returns {number | null} the timestamp of that orbit if it exists, null otherwise
 */
export const getOrbitStartTimeFromEh = atom(
  (get) => (orbitEh: EntryHashB64) => {
    const state = get(appStateAtom);
    const orbitActionHash = Object.keys(state.orbitNodes.byHash).find(
      (key) => state.orbitNodes.byHash[key].eH === orbitEh,
    );
    if(!orbitActionHash) return null;
    return state.orbitNodes.byHash[orbitActionHash]?.startTime;
  }
);

/**
 * Write-only atom for updating orbit details using its entry hash.
 *
 * @param {EntryHashB64} params.orbitEh - The entry hash of the orbit to update.
 * @param {Partial<OrbitNodeDetails>} params.update - The partial orbit details to update.
 *
 * This atom directly updates the orbit details in the global app state.
 * If the orbit is not found, no update occurs.
 */
export const setOrbitWithEntryHashAtom = atom(
  null,
  (
    get,
    set,
    {
      orbitEh,
      update,
    }: { orbitEh: EntryHashB64; update: Partial<OrbitNodeDetails> },
  ) => {
    set(appStateAtom, (prevState) => {
      const orbitActionHash = Object.keys(prevState.orbitNodes.byHash).find(
        (key) => prevState.orbitNodes.byHash[key].eH === orbitEh,
      );

      if (!orbitActionHash) return prevState; // Orbit not found, no update

      return {
        ...prevState,
        orbitNodes: {
          ...prevState.orbitNodes,
          byHash: {
            ...prevState.orbitNodes.byHash,
            [orbitActionHash]: {
              ...prevState.orbitNodes.byHash[orbitActionHash],
              ...update,
            },
          },
        },
      };
    });
  },
);
/**
 * Gets the frequency of a given Orbit from the AppState
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the frequency of the orbit, or null if the orbit doesn't exist
 */
export const getOrbitFrequency = (orbitHash: ActionHashB64) => {
  const selectFrequency = atom<Frequency.Rationals | null>((get) => {
    const state = get(appStateAtom);
    const orbit = state.orbitNodes.byHash[orbitHash] as OrbitDetails;
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
  (
    get,
    set,
    {
      orbitHash,
      date,
      winIndex,
      hasWin,
    }: {
      orbitHash: ActionHashB64;
      date: string;
      winIndex?: number;
      hasWin: boolean;
    },
  ) => {
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
        ? (currentWinData[date] as boolean[])
        : new Array(Math.round(frequency)).fill(false);
      const newDayData = [...currentDayData];
      if (winIndex !== undefined && winIndex < Math.round(frequency)) {
        newDayData[winIndex] = hasWin;
      }
      newWinData = { ...currentWinData, [date]: newDayData } as WinData<
        typeof frequency
      >;
    } else {
      newWinData = { ...currentWinData, [date]: hasWin } as WinData<
        typeof frequency
      >;
    }

    set(appStateAtom, {
      ...state,
      wins: {
        ...state.wins,
        [orbitHash]: newWinData,
      },
    });
  },
);

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
