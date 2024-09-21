import { atom } from "jotai";
import { appStateAtom } from "./store";
import { SphereHashes } from "./currentSphereHierarchyAtom";

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
export const sphereHasCachedNodesAtom = atom((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  const currentSphere = state.spheres.byHash[currentSphereHash];
  
  if (!currentSphere) return false;
  
  const rootOrbitHashes = currentSphere.hierarchyRootOrbitEntryHashes;
  return rootOrbitHashes.some(hash => {
    const hierarchy = state.hierarchies.byRootOrbitEntryHash[hash];
    return hierarchy && hierarchy.nodeHashes.length > 0;
  });
});


/**
 * Atom for the current sphere hashes
 */
export const currentSphereHashesAtom = atom<SphereHashes>((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  const currentSphere = state.spheres.byHash[currentSphereHash];
  
  return currentSphere
    ? {
        entryHash: currentSphere.details.entryHash,
        actionHash: currentSphereHash,
      }
    : {};
});