import { getOrbitNodeDetailsFromIdAtom } from "./orbit";
// ui/src/state/hierarchy.ts
import { ActionHashB64 } from "@holochain/client";
import { atom } from "jotai";
import {
  HierarchyTraversalIndices,
  NodeContent,
  SphereHierarchyBounds,
} from "./types/hierarchy";
import { EntryHashB64 } from "@holochain/client";
import { appStateAtom } from "./store";
import { OrbitNodeDetails, RootOrbitEntryHash } from "./types/orbit";
import { Hierarchy } from "./types/hierarchy";
import { getSphereIdFromEhAtom } from "./sphere";
import { HierarchyNode } from "d3-hierarchy";
import { WinData } from "./types";
import { DateTime } from "luxon";

/** PRIMITIVE (not currently in AppState or IndexDB) */

/**
 * Atom representing the hierarchy bounds for each sphere.
 * @type {Atom<SphereHierarchyBounds>}
 */
export const currentSphereHierarchyBounds = atom<SphereHierarchyBounds>({});
(currentSphereHierarchyBounds as any).testId = "currentSphereHierarchyBounds";

/**
 * Atom representing the current indices for hierarchy traversal.
 * @type {Atom<HierarchyTraversalIndices>}
 */
export const currentSphereHierarchyIndices = atom<HierarchyTraversalIndices>({
  x: 0,
  y: 0,
});
(currentSphereHierarchyIndices as any).testId = "currentSphereHierarchyIndices";

/**
 * Atom for setting the current breadth in the hierarchy.
 * @type {WritableAtom<null, [number], void>}
 */
export const setCurrentBreadth = atom(null, (get, set, newBreadth: number) => {
  const prev = get(currentSphereHierarchyIndices);
  set(currentSphereHierarchyIndices, { ...prev, x: newBreadth });
});

/**
 * Atom for setting the current depth in the hierarchy.
 * @type {WritableAtom<null, [number], void>}
 */
export const setCurrentDepth = atom(null, (get, set, newDepth: number) => {
  const prev = get(currentSphereHierarchyIndices);
  set(currentSphereHierarchyIndices, { ...prev, x: newDepth });
});

/**
 * Atom for setting the depth range for a specific hierarchy.
 * @type {WritableAtom<null, [string, [number, number]], void>}
 */
export const setDepths = atom(
  null,
  (get, set, id: string, [min, max]: [number, number]) => {
    const prev = get(currentSphereHierarchyBounds);
    set(currentSphereHierarchyBounds, {
      ...prev,
      [id]: { ...prev[id], minDepth: min, maxDepth: max },
    });
  }
);

/**
 * Atom for setting the breadth range for a specific hierarchy.
 * @type {WritableAtom<null, [string, [number, number]], void>}
 */
export const setBreadths = atom(
  null,
  (get, set, id: string, [min, max]: [number, number]) => {
    const prev = get(currentSphereHierarchyBounds);
    set(currentSphereHierarchyBounds, {
      ...prev,
      [id]: { ...prev[id], minBreadth: min, maxBreadth: max },
    });
  }
);

/**
 * Primitive atom for passing vis traversal context to the next render.
 */
export const newTraversalLevelIndexId = atom<{
  id: EntryHashB64 | null;
  intermediateId?: EntryHashB64 | null;
  previousRenderSiblingIndex?: number;
  direction?: "up" | "down";
}>({
  id: null,
});
(newTraversalLevelIndexId as any).testId = "newTraversalLevelIndexId";

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
 * Atom for updating the appState with new hierarchy data, ready for potential serialisation and use in RPCs.
 * @type {WritableAtom<null, [string], void>}
 */
export const updateHierarchyAtom = atom(
  null,
  (
    get,
    set,
    newHierarchy: {
      rootData: HierarchyNode<
        NodeContent & { children?: HierarchyNode<NodeContent> }
      >;
      each: Function;
      _json: string;
    }
  ) => {
    if (!newHierarchy?.rootData) return null;

    const currentAppState = get(appStateAtom);
    const rootNode = newHierarchy.rootData.data.content;
    const nodeHashes: ActionHashB64[] = [];
    const leafNodeHashes: ActionHashB64[] = [];
    // Derive nodeHashes, rootNode, etc. from the newHierarchy
    let currentHierarchyNode: EntryHashB64 | undefined = undefined;
    const possibleNodes = Object.keys(currentAppState.orbitNodes.byHash);

    newHierarchy.rootData.each((node) => {
      const eH = node.data.content;
      const id = possibleNodes.find(
        (key) => currentAppState.orbitNodes.byHash[key].eH === eH
      );
      if (!id) return;
      if (currentAppState.orbitNodes.currentOrbitHash == id)
        currentHierarchyNode = id;
      nodeHashes.push(id as ActionHashB64);
      if (node.data?.children && node.data.children.length == 0)
        leafNodeHashes.push(id as ActionHashB64);
    });
    // Update the appState with the new hierarchy data
    const updatedHierarchy: Hierarchy = {
      rootNode,
      json: newHierarchy?._json,
      bounds: undefined, // TODO: decide whether to keep this as a primitive atom and remove from appstate
      indices: undefined, // TODO: decide whether to keep this as a primitive atom and remove from appstate
      currentNode: currentHierarchyNode,
      nodeHashes,
      leafNodeHashes,
    };

    set(appStateAtom, {
      ...currentAppState,
      hierarchies: {
        ...currentAppState.hierarchies,
        byRootOrbitEntryHash: {
          ...currentAppState.hierarchies.byRootOrbitEntryHash,
          [rootNode]: updatedHierarchy,
        },
      },
    });
  }
);

/**
 * Atom to check if a node hash exists in the leafNodeHashes of any hierarchy in appState.
 * @param nodeHash The node hash to check
 * @returns An atom that resolves to a boolean indicating existence, or lack of
 */
export const isLeafNodeHashAtom = (nodeHash: ActionHashB64) => {
  return atom<boolean>((get) => {
    const state = get(appStateAtom);
    const hierarchies = state.hierarchies.byRootOrbitEntryHash;

    for (const hierarchyKey in hierarchies) {
      const hierarchy = hierarchies[hierarchyKey];
      if (hierarchy?.leafNodeHashes?.includes(nodeHash)) {
        return true;
      }
    }
    return false;
  });
};

/**
 * Calculates the current streak for a specific orbit (either through wins - leaf nodes - or through derived win completion - nonleaf nodes)
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the streak count, or null if the orbit doesn't exist
 */
export const calculateCurrentStreakAtom = (orbitHash: ActionHashB64) => {
  const calculateStreak = atom<number | null>((get) => {
    const state = get(appStateAtom);
    const currentDate = DateTime.now().toLocaleString();
    const orbit: OrbitNodeDetails | null = get(
      getOrbitNodeDetailsFromIdAtom(orbitHash)
    );
    const winData = state.wins[orbitHash] || {};

    if (!orbit) return null;

    let streak = 0;
    let date = DateTime.fromFormat(currentDate, "dd/MM/yyyy");

    while (true) {
      const dateString = date.toFormat("dd/MM/yyyy");
      const winEntry = winData[dateString];

      if (winEntry === undefined) continue;

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

/**
 * Calculates the longest streak for a specific orbit based on its win data.
 * @param orbitHash The ActionHash of the orbit
 * @returns An atom that resolves to the longest streak count, or null if the orbit doesn't exist
 */
export const calculateLongestStreakAtom = (orbitHash: ActionHashB64) => {
  const calculateLongestStreak = atom<number | null>((get) => {
    const state = get(appStateAtom);
    const orbit = state.orbitNodes.byHash[orbitHash];
    const winData = state.wins[orbitHash] || {};

    if (!orbit) return null;

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

// TODO: implement below
/**
 * Gets all orbits for a given hierarchy
 * @param rootOrbitEntryHash The EntryHash of the root orbit
 * @returns An atom that resolves to an array of orbit details
 */
export const getHierarchyOrbitDetailsAtom = (
  rootOrbitEntryHash: RootOrbitEntryHash
) => {
  const selectOrbits = atom<OrbitNodeDetails[] | null>((get) => {
    const state = get(appStateAtom);
    const hierarchy =
      state.hierarchies.byRootOrbitEntryHash[rootOrbitEntryHash];
    const sphereEh = state.orbitNodes.byHash[rootOrbitEntryHash].sphereHash;
    const sphereId = get(getSphereIdFromEhAtom(sphereEh));

    if (!hierarchy || typeof sphereId !== "string") return null;

    return null; // TODO: flesh this out after getOrbitFromCache has been refactored
    // const sphereNodeDetailsCache = get(nodeCache.item(sphereId)) as
    //   | SphereOrbitNodeDetails
    //   | undefined;
    // if (!sphereNodeDetailsCache || typeof sphereNodeDetailsCache !== "object")
    //   return null;
    // return Object.values(sphereNodeDetailsCache);
  });
  return selectOrbits;
};

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
