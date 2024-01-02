import { mapZomeFn } from '../../connection'
import { DNAIdMappings, ById } from '../../types'
import { HAPP_DNA_NAME, HAPP_ZOME_NAME_PERSONAL_HABITS } from '../../../constants'
import { Sphere, SphereConnection } from '../../generated'
import { createEdges } from '../../utils'
import { EntryRecord } from '@holochain-open-dev/utils'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const read = mapZomeFn<ById, Sphere>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_sphere',
  )
  const readAll = mapZomeFn<null, Sphere[]>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_all_my_spheres',
  )

  return {
    sphere: async (_, args): Promise<Sphere> => {
      return read(args.id)
    },

    spheres: async () : Promise<Partial<SphereConnection>> => {
      const rawRecords : Sphere[] = await readAll(null);
      // const rawRecords = createEdges(maybeSpheres);
      console.log('get_all_my_sphere payload :>> ', rawRecords);
      
      if(typeof rawRecords !== 'object' || !rawRecords?.length) return Promise.resolve(createEdges([]) as unknown as SphereConnection)

      const entryRecords = rawRecords!.map((record: any) => new EntryRecord<Sphere>(record));
      // TODO: change backend fn so records are visible and complete the following line 
      const sphereConnection = createEdges(entryRecords.map((entryRecord: EntryRecord<Sphere>) => ({...entryRecord.entry, id: entryRecord.entryHash })))  as Partial<SphereConnection> & any; // Need to resolve type errors when no pagination implemented
      console.log('entryRecords :>> ', sphereConnection);
      return Promise.resolve(sphereConnection)
    },
  }
}
