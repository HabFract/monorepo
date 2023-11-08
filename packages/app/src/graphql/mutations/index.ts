import { DNAIdMappings } from '../types'
import Habit from './orbit'
import User from './user'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  return {
    ...Habit(dnaConfig, conductorUri),
    ...User(dnaConfig, conductorUri),
  }
}
