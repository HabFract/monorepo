import { atom } from "jotai";
import { appStateAtom } from "./store";
import { SphereDetails, SphereHashes } from "./types/sphere";

/**
 * Read-write atom for the current sphere's hashes
 * @returns {SphereHashes | {}}
 */
export const currentSphereHashesAtom = atom(
  (get) => {
    const state = get(appStateAtom);
    const currentSphereHash = state.spheres.currentSphereHash;
    const currentSphere = state.spheres.byHash[currentSphereHash];

    return currentSphere
      ? {
          entryHash: currentSphere.details.entryHash,
          actionHash: currentSphereHash,
        }
      : {};
  },
  (_get, set, newSphereHashes: SphereHashes) => {
    set(appStateAtom, (prevState) => {
      const newCurrentSphereHash = newSphereHashes.actionHash || "";
      return {
        ...prevState,
        spheres: {
          ...prevState.spheres,
          currentSphereHash: newCurrentSphereHash,
        },
      };
    });
  },
);

/**
 * Derived atom for the current sphere details
 * @returns {SphereDetails | null} The current sphere object or null if no sphere is selected
 */
export const currentSphereAtom = atom<SphereDetails | null>((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  return state.spheres.byHash[currentSphereHash]?.details || null;
});

/**
 * Derived atom to check if a Sphere has cached nodes
 * @returns {boolean} True if the current sphere has cached nodes, false otherwise
 */
export const currentSphereHasCachedNodesAtom = atom<boolean>((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  const currentSphere = state.spheres.byHash[currentSphereHash];

  if (!currentSphere) return false;

  const rootOrbitHashes = currentSphere.hierarchyRootOrbitEntryHashes;
  return rootOrbitHashes.some((hash) => {
    const hierarchy = state.hierarchies.byRootOrbitEntryHash[hash];
    return hierarchy && hierarchy.nodeHashes.length > 0;
  });
});
