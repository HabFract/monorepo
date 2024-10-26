import { atom } from "jotai";
import { appStateAtom } from "./store";
import { SphereDetails, SphereHashes } from "./types/sphere";
import { nodeCache } from "./store";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { getOrbitNodeDetailsFromEhAtom } from "./orbit";
import { AppState } from "./types/store";

/**
 * Read-write atom for the current sphere's hashes or null if the current hash doesn't resolve to a sphere's details
 * @returns {SphereHashes | null}
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
      : null;
  },
  (_get, set, newSphereHashes: SphereHashes) => {
    const prevState = _get(appStateAtom);
    const newCurrentSphereHash = newSphereHashes.actionHash || "";
    const newState = {
      ...prevState,
      spheres: {
        ...prevState.spheres,
        currentSphereHash: newCurrentSphereHash,
        byHash: {
          ...prevState.spheres.byHash,
          [newCurrentSphereHash]: {
            ...prevState.spheres.byHash[newCurrentSphereHash],
            details: {
              ...prevState.spheres.byHash[newCurrentSphereHash]?.details,
              entryHash: newSphereHashes.entryHash,
            },
          },
        },
      },
    } as AppState;
    set(appStateAtom, newState);
  }
);
(currentSphereHashesAtom as any).testId = "currentSphereHashes";

/**
 * Derived atom for the current sphere details
 * @returns {SphereDetails | null} The current sphere object or null if no sphere is selected
 */
export const currentSphereDetailsAtom = atom<SphereDetails | null>((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  return state.spheres.byHash[currentSphereHash]?.details || null;
});
(currentSphereDetailsAtom as any).testId = "currentSphereDetailsAtom";

/**
 * Derived atom to get a Sphere's id from it's eH
 * @returns {ActionHashB64 | null} The sphere's id or null if no sphere is present in app state
 */
export const getSphereIdFromEhAtom = (sphereEh: EntryHashB64) =>
  atom<ActionHashB64 | null>((get) => {
    const state = get(appStateAtom);
    const sphere = Object.entries(state.spheres.byHash).find(
      ([_id, sphereDetails]) => sphereDetails.details.entryHash == sphereEh
    );

    if (!sphere) return null;

    return sphere[0] || null;
  });

/**
 * Derived atom to check if current Sphere has cached nodes in the IndexDB
 * @returns {boolean | null} See below
 */
export const currentSphereHasCachedNodesAtom = atom<boolean | null>((get) => {
  const state = get(appStateAtom);
  const sphereId = state.spheres.currentSphereHash;
  if (!sphereId) return false;

  return get(sphereHasCachedNodesAtom(sphereId));
});

/**
 * Derived atom to check if a particular Sphere has cached nodes in the IndexDB
 * @returns {boolean | null}
 *  - True if the current sphere has cached nodes
 *  - null if there are no hierarchies/not enough data associated with this sphere Id
 */
export const sphereHasCachedNodesAtom = (sphereId: ActionHashB64) =>
  atom<boolean | null>((get) => {
    const state = get(appStateAtom);
    const selectedSphere = state.spheres.byHash[sphereId];
    if (!selectedSphere) return null;
    const rootOrbitHashes = selectedSphere.hierarchyRootOrbitEntryHashes;
    if (!rootOrbitHashes || rootOrbitHashes.length == 0) return null;
    const sphereNodeDetailsCache = get(nodeCache.item(sphereId));
    if (!sphereNodeDetailsCache) return null;
    // This now strictly checks that we have both an entry in the store (hashes, used for indexing) and an indexDB cache entry for each node.
    // It makes no assurances about staleness of the data or otherwise

    return rootOrbitHashes.every((nodeEh) => {
      // TODO: strengthen this check when we have properly cached hierarchy info
      // const hierarchy = state.hierarchies.byRootOrbitEntryHash[hash];
      // return (
      //   hierarchy &&
      //   hierarchy.nodeHashes.every((nodeEh: EntryHashB64) => {
      // const eH = get(getOrbitEhFromId(nodeId));
      const cacheItem = get(getOrbitNodeDetailsFromEhAtom(nodeEh));
      return !!cacheItem;
      //   })
      // );
    });
  });
