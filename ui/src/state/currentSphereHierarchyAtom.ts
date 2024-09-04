import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { atom } from "jotai";

import { sphereNodesAtom } from './sphere';

export interface SphereHashes {
  entryHash?: EntryHashB64;
  actionHash?: ActionHashB64;
}
export const currentSphere = atom<SphereHashes>({ entryHash: "",  actionHash: "", });

export interface HierarchyBounds {
  minDepth: number;
  maxDepth: number;
  minBreadth: number;
  maxBreadth: number;
}

export interface SphereHierarchyBounds {
  [sphereId: EntryHashB64] : HierarchyBounds
}

// Exposed by the useNodeTraversal hook
export const currentSphereHierarchyBounds = atom<SphereHierarchyBounds>({});

export const setDepths = atom(
    null,
    (get, set, id, [min, max]) => {
      const prev = get(currentSphereHierarchyBounds)
      
      set(currentSphereHierarchyBounds, { ...prev, [id as any]: { ...prev[id as any], minDepth: min, maxDepth: max } })
    }
)

export const setBreadths = atom(
    null,
    (get, set, id, [min, max]) => {
      const prev = get(currentSphereHierarchyBounds)
      
      set(currentSphereHierarchyBounds, { ...prev, [id as any]: { ...prev[id as any], minBreadth: min, maxBreadth: max } })
    }
)