/* eslint-disable @typescript-eslint/no-explicit-any */
import { mapZomeFn } from '../../connection'
import { DNAIdMappings, ById } from '../../types'
import { HAPP_DNA_NAME, HAPP_ZOME_NAME_PERSONAL_HABITS } from '../../../constants'
import { Sphere, SphereConnection } from '../../generated'
import { createEdges } from '../../utils'
import { EntryRecord } from '@holochain-open-dev/utils'
import { encodeHashToBase64, Record as HolochainRecord } from '@holochain/client'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const read = mapZomeFn<ById, HolochainRecord>(
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
    sphere: async (_, args): Promise<Partial<Sphere>> => {
      const rawRecord = await read(args.id)
      const entryRecord = new EntryRecord<Sphere>(rawRecord);
      return {
        ...entryRecord.entry,
        id: encodeHashToBase64(entryRecord.actionHash),
        eH: encodeHashToBase64(entryRecord.entryHash),
      }
    },

    spheres: async () : Promise<Partial<SphereConnection>> => {
      const rawRecords : Sphere[] = await readAll(null);
      console.log('get_all_my_sphere payload :>> ', rawRecords);
      
      if(typeof rawRecords !== 'object' || !rawRecords?.length) return Promise.resolve(createEdges([]) as unknown as SphereConnection)

      const entryRecords = rawRecords!.map((record: any) => new EntryRecord<Sphere>(record));

      const sphereConnection = createEdges(entryRecords.map((entryRecord: EntryRecord<Sphere>) => ({ ...entryRecord.entry, id: entryRecord.actionHash, eH: encodeHashToBase64(entryRecord.entryHash) }))) as Partial<SphereConnection> & any; // Need to resolve type errors when no pagination implemented

      return Promise.resolve(sphereConnection)
    },
  }
}
