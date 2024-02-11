import { atom } from 'jotai'
import { MiniDb } from 'jotai-minidb'

export const dbAtom = new MiniDb()

export default dbAtom;