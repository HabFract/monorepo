import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { nodeCache, OrbitNodeDetails } from "./jotaiKeyValueStore";
import { currentSphere } from "./currentSphereHierarchyAtom";

/**
 * Derived atom for SphereOrbitNodes
 * @returns {Record<ActionHashB64, OrbitNodeDetails> | null} A record of orbit nodes for the current sphere or null if no sphere is selected
 */
export const sphereNodesAtom = atom((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  const currentSphere = state.spheres.byHash[currentSphereHash];

  if (!currentSphere) return null;

  const sphereNodes: Record<ActionHashB64, OrbitNodeDetails> = {};
  currentSphere.hierarchyRootOrbitEntryHashes.forEach(rootHash => {
    const hierarchy = state.hierarchies.byRootOrbitEntryHash[rootHash];
    if (hierarchy) {
      hierarchy.nodeHashes.forEach(nodeHash => {
        const node = state.orbitNodes.byHash[nodeHash];
        if (node) {
          sphereNodes[nodeHash] = node;
        }
      });
    }
  });

  return Object.keys(sphereNodes).length > 0 ? sphereNodes : null;
});

export const currentOrbitId = atom<{id: ActionHashB64 | null}>({id: null});

export const currentOrbitDetails = atom<OrbitNodeDetails | undefined>((get) => {
  const currentSphereNodes = get(sphereNodesAtom);
  const currentOrbitAh = get(currentOrbitId)?.id;
  if(!currentSphereNodes || !currentOrbitAh) return;
  return currentSphereNodes[currentOrbitAh];
});

export const currentOrbitCoords = atom<{x: number, y: number}>({ x:0, y:0 });

export const newTraversalLevelIndexId = atom<{id: ActionHashB64 | null}>({id: null});

export const getOrbitOfCurrentSphereByIdAtom = (id: ActionHashB64) => atom<OrbitNodeDetails | undefined>((get) => {
    const currentSphereHashes = get(currentSphere);
    if (!currentSphereHashes?.actionHash) return;

    const currentSphereNodes = get(sphereNodesAtom);
    if (!currentSphereNodes) return;

    const orbitDetails = currentSphereNodes[id];
    if (!orbitDetails) return;

    return orbitDetails
});

export const setOrbit = atom(
  null,
  (get, set, { orbitEh, update }: { orbitEh: EntryHashB64; update: Partial<OrbitNodeDetails> }) => {
    const currentSphereHashes = get(currentSphere);
    if (!currentSphereHashes?.actionHash) return;

    const currentSphereNodes = get(sphereNodesAtom);
    if (!currentSphereNodes) return;

    const orbitDetails = currentSphereNodes[orbitEh];
    if (!orbitDetails) return;

    const updatedOrbitDetails = { ...orbitDetails, ...update };

    // Update the atom state
    set(nodeCache.set, currentSphereHashes.actionHash, {
      ...currentSphereNodes,
      [orbitEh]: updatedOrbitDetails,
    });
  }
);