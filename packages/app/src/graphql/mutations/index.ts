import { DNAIdMappings } from '../types'
import Habit from './habit'
import User from './user'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  return {
    ...Habit(dnaConfig, conductorUri),
    ...User(dnaConfig, conductorUri),
  }
}
