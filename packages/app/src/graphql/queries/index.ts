import { DNAIdMappings } from '../types'
import Burner from './sphere'
import Habit from './orbit'
import User from './user'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  return {
    ...Burner(dnaConfig, conductorUri),
    ...Habit(dnaConfig, conductorUri),
    ...User(dnaConfig, conductorUri),
  }
}
