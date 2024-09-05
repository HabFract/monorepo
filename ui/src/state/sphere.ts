import { atom, Atom } from "jotai";
import { SphereHashes, currentSphere } from "./currentSphereHierarchyAtom";
import { nodeCacheItemsAtom, SphereNodeDetailsCache, SphereOrbitNodes } from "./jotaiKeyValueStore";

// Derived atom for SphereOrbitNodes
export const sphereNodesAtom = atom((get) => {
  const items = get(nodeCacheItemsAtom);
  const currentSphereHashes: SphereHashes = get(currentSphere as Atom<SphereHashes>);
  return currentSphereHashes?.actionHash && items
    ? (items[
        currentSphereHashes.actionHash as keyof SphereNodeDetailsCache
      ] as SphereOrbitNodes)
    : undefined;
});

// Derived atom for if a Sphere has cached nodes
export const sphereHasCachedNodesAtom = atom((get) => {
  const nodeDetails = get(sphereNodesAtom);
  return typeof nodeDetails == 'object' && Object.values(nodeDetails).length !== 0
});
