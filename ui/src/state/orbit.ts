import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { atom } from "jotai";
import { nodeCache, OrbitNodeDetails, sphereNodesAtom } from "./jotaiKeyValueStore";
import { currentSphere } from "./currentSphereHierarchyAtom";

export const currentOrbitId = atom<{id: ActionHashB64 | null}>({id: null});

export const currentOrbitDetails = atom<OrbitNodeDetails | undefined>((get) => {
  const currentSphereNodes = get(sphereNodesAtom);
  const currentOrbitAh = get(currentOrbitId)?.id;
  if(!currentSphereNodes || !currentOrbitAh) return;
  return currentSphereNodes[currentOrbitAh];
});

export const currentOrbitCoords = atom<{x: number, y: number}>({ x:0, y:0 });

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