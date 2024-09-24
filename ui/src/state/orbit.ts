import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { nodeCache } from "./jotaiKeyValueStore";
import { appStateAtom } from "./store";
import { SphereOrbitNodes } from "./types/sphere";
import { OrbitNodeDetails } from "./types/orbit";
import { Orbit } from "../graphql/generated";
import { currentSphereHashesAtom } from "./sphere";

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
export const currentOrbitDetailsAtom = atom<OrbitNodeDetails | null>((get) => {
  const state = get(appStateAtom);
  const currentOrbitHash = state.orbitNodes.currentOrbitHash;
  if (!currentOrbitHash) return null;
  
  return state.orbitNodes.byHash[currentOrbitHash] || null;
});

/**
 * Read-write atom for the current orbit ID
 * Reads from and writes to the global app state
 * @returns {{id: ActionHashB64} | null} Details of the current Orbit's Node
*/
export const currentOrbitIdAtom = atom(
  (get) => {
    const state = get(appStateAtom);
    return state.orbitNodes.currentOrbitHash
      ? { id: state.orbitNodes.currentOrbitHash }
      : null
  },
  (get, set, newOrbitId: ActionHashB64) => {
    set(appStateAtom, (prevState) => ({
      ...prevState,
      orbitNodes: {
        ...prevState.orbitNodes,
        currentOrbitHash: newOrbitId
      }
    }));
  }
);

/**
 * Atom factory that creates an atom for getting orbit details by ID.
 * 
 * @param orbitId - The ActionHashB64 of the orbit to retrieve.
 * @returns An atom that, when read, returns the OrbitNodeDetails for the specified orbitId, or null if not found.
 */
export const getOrbitAtom = (orbitId: ActionHashB64) => atom<OrbitNodeDetails | null>((get) => {
  const state = get(appStateAtom);
  return state.orbitNodes.byHash[orbitId] || null;
});

/**
 * Write-only atom for updating orbit details using its entry hash.
 * 
 * @param {EntryHashB64} params.orbitEh - The entry hash of the orbit to update.
 * @param {Partial<OrbitNodeDetails>} params.update - The partial orbit details to update.
 * 
 * This atom directly updates the orbit details in the global app state.
 * If the orbit is not found, no update occurs.
 */
export const setOrbitWithEntryHashAtom = atom(
  null,
  (get, set, { orbitEh, update }: { orbitEh: EntryHashB64; update: Partial<OrbitNodeDetails> }) => {
    set(appStateAtom, (prevState) => {
      const orbitActionHash = Object.keys(prevState.orbitNodes.byHash).find(
        key => prevState.orbitNodes.byHash[key].eH === orbitEh
      );

      if (!orbitActionHash) return prevState; // Orbit not found, no update

      return {
        ...prevState,
        orbitNodes: {
          ...prevState.orbitNodes,
          byHash: {
            ...prevState.orbitNodes.byHash,
            [orbitActionHash]: {
              ...prevState.orbitNodes.byHash[orbitActionHash],
              ...update
            }
          }
        }
      };
    });
  }
);


export const newTraversalLevelIndexId = atom<{id: ActionHashB64 | null}>({id: null});
