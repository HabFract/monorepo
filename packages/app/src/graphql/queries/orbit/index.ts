import { mapZomeFn } from '../../connection'
import { DNAIdMappings, ById } from '../../types'
import { HAPP_DNA_NAME, HAPP_ZOME_NAME_PERSONAL_HABITS } from '../../../constants'
import { Orbit, OrbitConnection } from '../../generated'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const read = mapZomeFn<ById, Orbit>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_orbit',
  )
  const readAll = mapZomeFn<null, OrbitConnection>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_all_orbits',
  )

  return {
    orbit: async (_, args): Promise<Orbit> => {
      return read(args.id)
    },

    orbits: async (): Promise<OrbitConnection> => {
      const maybeOrbits = await readAll(null)

      return Promise.resolve(maybeOrbits || [])
    },
  }
}
