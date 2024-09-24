// ui/src/state/hierarchy.ts
import { atom } from "jotai";
import { HierarchyTraversalIndices, SphereHierarchyBounds } from "./types/hierarchy";

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