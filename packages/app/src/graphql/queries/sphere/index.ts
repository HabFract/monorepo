import { mapZomeFn } from '../../connection'
import { DNAIdMappings, ById } from '../../types'
import { HAPP_DNA_NAME, HAPP_ZOME_NAME_PERSONAL_HABITS } from '../../../constants'
import { Sphere, SphereConnection } from '../../generated'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const read = mapZomeFn<ById, Sphere>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_sphere',
  )
  const readAll = mapZomeFn<null, SphereConnection>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_all_spheres',
  )

  return {
    sphere: async (_, args): Promise<Sphere> => {
      return read(args.id)
    },

    spheres: async (): Promise<SphereConnection> => {
      const maybeSpheres = await readAll(null)

      return Promise.resolve(maybeSpheres || [])
    },
  }
}
