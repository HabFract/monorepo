import { Provider, atom, createStore } from 'jotai'
import { MiniDb } from 'jotai-minidb'
import { Orbit } from '../graphql/generated'

const dbAtom = new MiniDb()

export const myStore = createStore()

const db = atom(dbAtom.setMany);

export const unsub = myStore.sub(db, () => {
  console.log('countAtom value is changed to', myStore.get(db))
})

export const mapToCacheObject = (orbit: Orbit) => ({
  id: orbit.id,
  eH: orbit.eH,
  name: orbit.name,
  scale: orbit.scale,
  description: orbit.metadata?.description,
  startTime: orbit.metadata?.timeframe.startTime,
  endTime: orbit.metadata?.timeframe.endTime,
  checked: false
})

export default dbAtom;