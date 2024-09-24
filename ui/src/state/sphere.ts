import { atom } from "jotai";
import { appStateAtom } from "./store";
import { SphereHashes } from "./hierarchy";

/**
 * Derived atom for the current sphere details
 * @returns {object | null} The current sphere object or undefined if no sphere is selected
 */
export const currentSphereAtom = atom((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  return state.spheres.byHash[currentSphereHash] || null;
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
      const newCurrentSphereHash = newSphereHashes.actionHash || '';
      let newSphere = prevState.spheres.byHash[newCurrentSphereHash];

      if (!newSphere) {
        // Create a new sphere if it doesn't exist
        newSphere = {
          details: {
            entryHash: newSphereHashes.entryHash,
            name: "New Sphere", // You might want to set default values here
            description: "",
            hashtag: "",
            image: "",
          },
          hierarchyRootOrbitEntryHashes: [],
        };
      }

      return {
        ...prevState,
        spheres: {
          ...prevState.spheres,
          currentSphereHash: newCurrentSphereHash,
          byHash: {
            ...prevState.spheres.byHash,
            [newCurrentSphereHash]: {
              ...newSphere,
              details: {
                ...newSphere.details,
                entryHash: newSphereHashes.entryHash || newSphere.details.entryHash,
              },
            },
          },
        },
      };
    });
  }  
);
