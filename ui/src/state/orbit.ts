import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { nodeCache } from "./jotaiKeyValueStore";
import { currentSphere } from "./currentSphereHierarchyAtom";
import { appStateAtom } from "./store";
import { SphereOrbitNodes } from "./types/sphere";
import { OrbitNodeDetails } from "./types/orbit";
import { Orbit } from "../graphql/generated";

/**
 * Transforms from graphQL repsonses into a form expected by state management
 * @returns {OrbitNodeDetails} A record of orbit nodes for the current sphere or null if no sphere is selected
 */
export const mapToCacheObject = (orbit: Orbit): OrbitNodeDetails => ({
  id: orbit.id,
  eH: orbit.eH,
  parentEh: orbit.parentHash || undefined,
  name: orbit.name,
  scale: orbit.scale,
  description: orbit.metadata?.description || "",
  startTime: orbit.metadata?.timeframe.startTime,
  endTime: orbit.metadata?.timeframe.endTime || undefined,
});

/**
 * Derived atom for current SphereOrbitNodes
 * @returns {SphereOrbitNodes | null} A record of orbit nodes for the current sphere or null if no sphere is selected
 */
export const currentSphereOrbitNodesAtom = atom<SphereOrbitNodes | null>((get) => {
  const state = get(appStateAtom);
  const currentSphereHash = state.spheres.currentSphereHash;
  const currentSphere = state.spheres.byHash[currentSphereHash];
console.log('currentSphere :>> ', currentSphere);
  if (!currentSphere) return null;

  const sphereNodes: SphereOrbitNodes = {};
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

/**
* Derived atom for current OrbitNodeDetails
* @returns {OrbitNodeDetails | null} Details of the current Orbit's Node
*/
export const currentOrbitDetailsAtom = atom<OrbitNodeDetails | undefined>((get) => {
  const currentSphereNodes = get(currentSphereOrbitNodesAtom);
  const currentOrbitAh = get(currentOrbitId)?.id;
  if(!currentSphereNodes || !currentOrbitAh) return;
  return currentSphereNodes[currentOrbitAh];
});

export const currentOrbitId = atom<{id: ActionHashB64 | null}>({id: null});


export const currentOrbitCoords = atom<{x: number, y: number}>({ x:0, y:0 });

export const newTraversalLevelIndexId = atom<{id: ActionHashB64 | null}>({id: null});

export const getCurrentSphereOrbitByIdAtom = (nodeId: ActionHashB64) => atom<OrbitNodeDetails | undefined>((get) => {
    const currentSphereHashes = get(currentSphere);
    if (!currentSphereHashes?.actionHash) return;

    const currentSphereNodes = get(currentSphereOrbitNodesAtom);
    if (!currentSphereNodes) return;

    const orbitDetails = currentSphereNodes[nodeId];
    if (!orbitDetails) return;

    return orbitDetails
});

export const setOrbit = atom(
  null,
  (get, set, { orbitEh, update }: { orbitEh: EntryHashB64; update: Partial<OrbitNodeDetails> }) => {
    const currentSphereHashes = get(currentSphere);
    if (!currentSphereHashes?.actionHash) return;

    const currentSphereNodes = get(currentSphereOrbitNodesAtom);
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