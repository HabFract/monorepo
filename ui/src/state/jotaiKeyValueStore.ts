import { Atom, atom, createStore } from "jotai";
import { MiniDb } from "jotai-minidb";
import { Orbit, Scale } from "../graphql/generated";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { currentSphere, SphereHashes } from "./currentSphereHierarchyAtom";

export const nodeCache = new MiniDb();

export const store = createStore();

const nodeCacheItemsAtom = atom((get) => get(nodeCache.items));

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

export interface OrbitNodeDetails {
  id: ActionHashB64;
  eH?: EntryHashB64;
  parentEh?: EntryHashB64;
  description?: string;
  name: string;
  scale: Scale;
  startTime?: number;
  endTime?: number;
  path?: string;
  wins: { [dayIndex: string]: boolean };
}

export type SphereOrbitNodes = {
  [key: ActionHashB64]: OrbitNodeDetails;
};

export type SphereNodeDetailsCache = {
  [key: ActionHashB64]: SphereOrbitNodes;
};

export const mapToCacheObject = (orbit: Orbit): OrbitNodeDetails => ({
  id: orbit.id,
  eH: orbit.eH,
  parentEh: orbit.parentHash || undefined,
  name: orbit.name,
  scale: orbit.scale,
  description: orbit.metadata?.description || "",
  startTime: orbit.metadata?.timeframe.startTime,
  endTime: orbit.metadata?.timeframe.endTime || undefined,
  wins: {},
});
