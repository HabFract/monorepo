import { DNAIdMappings } from '../types'
import Orbit from './orbit'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  return {
    ...Orbit(dnaConfig, conductorUri),
  }
}
