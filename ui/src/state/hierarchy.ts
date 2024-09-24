// ui/src/state/hierarchy.ts
import { atom } from "jotai";
import { HierarchyTraversalIndices, SphereHierarchyBounds } from "./types/hierarchy";
import { ActionHashB64 } from "@holochain/client";
import { appStateAtom } from "./store";
import { OrbitNodeDetails, RootOrbitEntryHash } from "./types/orbit";
import { Hierarchy } from "./types/hierarchy";

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

/**
 * Atom representing the hierarchy bounds for each sphere.
 * @type {Atom<SphereHierarchyBounds>}
 */
export const currentSphereHierarchyBounds = atom<SphereHierarchyBounds>({});

/**
 * Atom representing the current indices for hierarchy traversal.
 * @type {Atom<HierarchyTraversalIndices>}
 */
export const currentSphereHierarchyIndices = atom<HierarchyTraversalIndices>({x: 0, y: 0});

/**
 * Atom for setting the current breadth in the hierarchy.
 * @type {WritableAtom<null, [number], void>}
 */
export const setCurrentBreadth = atom(
    null,
    (get, set, newBreadth: number) => {
      const prev = get(currentSphereHierarchyIndices)
      set(currentSphereHierarchyIndices, { ...prev, x: newBreadth })
    }
)

/**
 * Atom for setting the current depth in the hierarchy.
 * @type {WritableAtom<null, [number], void>}
 */
export const setCurrentDepth = atom(
    null,
    (get, set, newDepth: number) => {
      const prev = get(currentSphereHierarchyIndices)
      set(currentSphereHierarchyIndices, { ...prev, x: newDepth })
    }
)

/**
 * Atom for setting the depth range for a specific hierarchy.
 * @type {WritableAtom<null, [string, [number, number]], void>}
 */
export const setDepths = atom(
    null,
    (get, set, id: string, [min, max]: [number, number]) => {
      const prev = get(currentSphereHierarchyBounds)
      set(currentSphereHierarchyBounds, { ...prev, [id]: { ...prev[id], minDepth: min, maxDepth: max } })
    }
)

/**
 * Atom for setting the breadth range for a specific hierarchy.
 * @type {WritableAtom<null, [string, [number, number]], void>}
 */
export const setBreadths = atom(
    null,
    (get, set, id: string, [min, max]: [number, number]) => {
      const prev = get(currentSphereHierarchyBounds)
      set(currentSphereHierarchyBounds, { ...prev, [id]: { ...prev[id], minBreadth: min, maxBreadth: max } })
    }
)

/**
 * Primitive atom for passing vis traversal context to the next render.
 */
export const newTraversalLevelIndexId = atom<{id: ActionHashB64 | null}>({id: null});
