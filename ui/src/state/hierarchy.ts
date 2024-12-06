import {
  getOrbitNodeDetailsFromEhAtom,
  getOrbitNodeDetailsFromIdAtom,
} from "./orbit";
// ui/src/state/hierarchy.ts
import { ActionHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { hierarchy } from "d3-hierarchy";
import {
  HierarchyTraversalIndices,
  NodeContent,
  SphereHierarchyBounds,
} from "./types/hierarchy";
import { EntryHashB64 } from "@holochain/client";
import { appStateAtom, nodeCache } from "./store";
import { OrbitNodeDetails, RootOrbitEntryHash } from "./types/orbit";
import { Hierarchy } from "./types/hierarchy";
import { getSphereIdFromEhAtom } from "./sphere";
import { HierarchyNode } from "d3-hierarchy";
import { WinData, WinDataPerOrbitNode } from "./types";
import { DateTime } from "luxon";
import { calculateWinDataForNonLeafNodeAtom } from "./win";

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
      sphereAh: ActionHashB64;
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
    const currentSphereHierarchyRootNodes = currentAppState.spheres.byHash[newHierarchy.sphereAh]?.hierarchyRootOrbitEntryHashes || [];
    const newState = {
      ...currentAppState,
      spheres: {
        ...currentAppState.spheres,
        byHash: {
          ...currentAppState.spheres.byHash,
          [newHierarchy.sphereAh]: {
            ...currentAppState.spheres.byHash[newHierarchy.sphereAh],
            hierarchyRootOrbitEntryHashes: (currentSphereHierarchyRootNodes.includes(rootNode) ? currentSphereHierarchyRootNodes : [
              ...currentSphereHierarchyRootNodes,
              rootNode,
            ]),
          },
        },
      },
      hierarchies: {
        ...currentAppState.hierarchies,
        byRootOrbitEntryHash: {
          ...currentAppState.hierarchies.byRootOrbitEntryHash,
          [rootNode]: updatedHierarchy,
        },
      },
    };

    set(appStateAtom, newState);
  }
);

/**
 * Gets the first root orbit entry hash for a given sphere.
 */
export const getSphereFirstRootOrbitEhAtom = (sphereEh: EntryHashB64) => 
  atom((get) => {
    const state = get(appStateAtom);
    const sphere = Object.values(state.spheres.byHash).find(
      sphere => sphere?.details?.entryHash === sphereEh
    );
    
    if (!sphere || !sphere.hierarchyRootOrbitEntryHashes.length) return null;
    return sphere.hierarchyRootOrbitEntryHashes[0];
  });


/**
 * Gets win data for a sphere's root orbit
 */
export const getSphereRootOrbitWinDataAtom = (sphereEh: EntryHashB64) => 
  atom((get) => {
    const rootOrbitEh = get(getSphereFirstRootOrbitEhAtom(sphereEh));
    if (!rootOrbitEh) return null;

    const orbit = get(getOrbitNodeDetailsFromEhAtom(rootOrbitEh));
    if (!orbit) return null;

    return get(calculateWinDataForNonLeafNodeAtom(rootOrbitEh));
  });

/**
 * Atom to check if a Action Hash exists in the leafNodeHashes of any hierarchy in appState.
 * @param nodeId The Action Hash to check
 * @returns An atom that resolves to a boolean indicating existence, or lack of
 */
export const isLeafNodeHashAtom = (nodeId: ActionHashB64) => {
  return atom<boolean>((get) => {
    const state = get(appStateAtom);
    const hierarchies = state.hierarchies.byRootOrbitEntryHash;

    for (const hierarchyKey in hierarchies) {
      const hierarchy = hierarchies[hierarchyKey];
      if (hierarchy?.leafNodeHashes?.includes(nodeId)) {
        return true;
      }
    }
    return false;
  });
};

// TODO: implement/test below
/**
 * Gets all descendant leaf nodes for a given orbit in a hierarchy
 * @param orbitHash The EntryHashB64 of the orbit to find descendants for
 * @returns An atom that resolves to an array of leaf node hashes, or null if the orbit doesn't exist
 */
export const getDescendantLeafNodesAtom = (orbitEh: EntryHashB64) => {
  return atom((get) => {
    const state = get(appStateAtom);

    const orbit: OrbitNodeDetails | null = get(
      getOrbitNodeDetailsFromEhAtom(orbitEh)
    );
    if (!orbit) return null;
    const orbitHash = orbit.id;

    // Find which hierarchy this orbit belongs to
    let hierarchyJson: string | null = null;
    let hierarchyRoot: string | null = null;

    for (const [root, h] of Object.entries(
      state.hierarchies.byRootOrbitEntryHash
    )) {
      if (h.nodeHashes.includes(orbitEh) || h.nodeHashes.includes(orbitHash)) {
        hierarchyJson = h.json;
        hierarchyRoot = root;
        break;
      }
    }
    if (!hierarchyJson || !hierarchyRoot) return null;

    // Parse the hierarchy JSON
    const hierarchyData = JSON.parse(hierarchyJson);
    const hierarchyD3 = hierarchy(hierarchyData[0]);
    const leaves =
      hierarchyD3.find((node) => node.data.content === orbit.eH)?.leaves() ||
      [];

    return leaves.map((node) => node.data);
  });
};

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
