import { createStore } from "jotai";
import { MiniDb } from "jotai-minidb";
import { atomWithStorage } from "jotai/utils";
import { AppState } from "./types/store";

/**
 * IndexDB store used to quickly index and retrieve data related to a node in the hierarchy.
 * Stored as a dictionary of SphereOrbitNodeDetails.
 *  I.e.
 *  Keyed by Sphere ActionHashB64, then by Orbit EntryHashB64, allowing easy retrieval by vis object callbacks
 *
 *  E.g.```
 *  {
 *     [sphere1ActionHash]: {
 *          [orbit1EntryHash]: {
 *               ...
 *          }
 *     },
 *     [sphere2ActionHash]: {
 *          [orbit1EntryHash]: {
 *               ...
 *          }
 *     },
 *  }```
 */
export const nodeCache = new MiniDb();

/**
 * Store object which can be used outside React components to get, set, or sub state
 */
export const store: any = createStore();

/**
 * Persisted atom for the entire app state, can later be used to hydrate app state when no Holochain network availability is possible
 */
export const appStateAtom = atomWithStorage<AppState>("appState", {
  spheres: {
    currentSphereHash: "",
    byHash: {},
  },
  hierarchies: {
    byRootOrbitEntryHash: {},
  },
  orbitNodes: {
    currentOrbitHash: null,
    byHash: {},
  },
  wins: {},
  ui: {
    listSortFilter: {
      sortCriteria: "name",
      sortOrder: "lowestToGreatest",
    },
    currentDay: new Date().toISOString(),
  },
});
