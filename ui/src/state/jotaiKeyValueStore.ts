import { Atom, atom, createStore } from "jotai";
import { MiniDb } from "jotai-minidb";
import { Orbit, Scale } from "../graphql/generated";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";

export const nodeCache = new MiniDb();

export const store: any = createStore();

export const nodeCacheItemsAtom = atom((get) => get(nodeCache.items));

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
  wins?: { [dayIndex: string]: boolean };
}
