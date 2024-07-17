import { createStore } from 'jotai'
import { MiniDb } from 'jotai-minidb'
import { Orbit, Scale } from '../graphql/generated'
import { ActionHashB64, EntryHashB64 } from '@holochain/client'

export const nodeCache = new MiniDb()

export const store = createStore()

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
  checked: boolean;
}

export type SphereOrbitNodes = {
  [key: ActionHashB64]: OrbitNodeDetails
}

export type SphereNodeDetailsCache = {
  [key: ActionHashB64]: SphereOrbitNodes
}

export const mapToCacheObject = (orbit: Orbit) : OrbitNodeDetails => ({
  id: orbit.id,
  eH: orbit.eH,
  parentEh: orbit.parentHash || undefined,
  name: orbit.name,
  scale: orbit.scale,
  description: orbit.metadata?.description || "",
  startTime: orbit.metadata?.timeframe.startTime,
  endTime: orbit.metadata?.timeframe.endTime || undefined,
  checked: false
})