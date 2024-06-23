import { ActionHashB64, EntryHashB64, encodeHashToBase64, Record as HolochainRecord } from '@holochain/client';
import { mapZomeFn } from '../../connection'
import { DNAIdMappings, ById } from '../../types'
import { HAPP_DNA_NAME, HAPP_ZOME_NAME_PERSONAL_HABITS } from '../../../constants'
import { Orbit, OrbitConnection } from '../../generated'
import { EntryRecord } from '@holochain-open-dev/utils'
import { createEdges } from '../../utils'
import { decode } from '@msgpack/msgpack';

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const read = mapZomeFn<ById, HolochainRecord>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_my_orbit',
  )
  const readAll = mapZomeFn<{sphereHash: EntryHashB64}, Orbit[]>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_all_my_sphere_orbits',
  )
  const getHierarchyForOrbit = mapZomeFn<ActionHashB64, String>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_orbit_hierarchy_json',
  )

  return {
    orbit: async (_, args): Promise<Orbit> => {
      const rawRecord = await read(args.id)
      console.log(rawRecord)
      const orbit = new EntryRecord<Orbit>(rawRecord)

      return {...orbit.entry, id: args.id, eH: encodeHashToBase64(orbit.entryHash) }
    },

    orbits: async (_, args): Promise<OrbitConnection> => {
      const rawRecords : Orbit[] = await readAll({sphereHash: args.sphereEntryHashB64});
      console.log("rawRecord,", rawRecords, args);
      if(typeof rawRecords !== 'object' || !rawRecords?.length) return Promise.resolve({ edges: [], pageInfo: undefined } as any)

      const entryRecords = rawRecords!.map((record: any) => new EntryRecord<Orbit>(record));
      const orbitConnection = createEdges(entryRecords.map((entryRecord: EntryRecord<Orbit>) => ({...entryRecord.entry, id: entryRecord.actionHash, eH: encodeHashToBase64(entryRecord.entryHash) })))  as Partial<OrbitConnection> & any; // Need to resolve type errors when no pagination implemented
console.log('orbitConnection :>> ', orbitConnection);
      return Promise.resolve(orbitConnection)
    },

    getOrbitHierarchy: async (_, args): Promise<String> => {
      const maybeJson = await getHierarchyForOrbit(args.params);
      const json = JSON.stringify({result: maybeJson})
      return Promise.resolve(JSON.stringify(json) || "")
    },
  }
}
