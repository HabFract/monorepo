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
