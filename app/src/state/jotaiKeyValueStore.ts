import { Provider, atom, createStore } from 'jotai'
import { MiniDb } from 'jotai-minidb'
import { Orbit } from '../graphql/generated'
import { OrbitNodeDetails } from '../components/vis/BaseVis'

const dbAtom = new MiniDb()

export const store = createStore()

const db = atom(dbAtom.setMany);

export const unsub = store.sub(db, () => {
  console.log('countAtom value is changed to', store.get(db))
})

export const mapToCacheObject = (orbit: Orbit) : OrbitNodeDetails => ({
  id: orbit.id,
  eH: orbit.eH,
  name: orbit.name,
  scale: orbit.scale,
  description: orbit.metadata?.description || "",
  startTime: orbit.metadata?.timeframe.startTime,
  endTime: orbit.metadata?.timeframe.endTime || undefined,
  checked: false
})

export default dbAtom;