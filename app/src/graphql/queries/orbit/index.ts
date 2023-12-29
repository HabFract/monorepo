import { ActionHashB64 } from '@holochain/client';
import { mapZomeFn } from '../../connection'
import { DNAIdMappings, ById } from '../../types'
import { HAPP_DNA_NAME, HAPP_ZOME_NAME_PERSONAL_HABITS } from '../../../constants'
import { Orbit, OrbitConnection } from '../../generated'
import { EntryRecord } from '@holochain-open-dev/utils'
import { createEdges } from '../../utils'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const read = mapZomeFn<ById, Orbit>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_orbit',
  )
  const readAll = mapZomeFn<null, Orbit[]>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'get_all_my_orbits',
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
      return read(args.id)
    },

    orbits: async (): Promise<OrbitConnection> => {

      const rawRecords : Orbit[] = await readAll(null);
      
      if(typeof rawRecords !== 'object' || !rawRecords?.length) return Promise.resolve({ edges: [], pageInfo: undefined } as any)

      const entryRecords = rawRecords!.map((record: any) => new EntryRecord<Orbit>(record));
      const orbitConnection = createEdges(entryRecords.map((entryRecord: EntryRecord<Orbit>) => ({...entryRecord.entry, id: entryRecord.actionHash })))  as Partial<OrbitConnection> & any; // Need to resolve type errors when no pagination implemented

      return Promise.resolve(orbitConnection)
    },

    getOrbitHierarchy: async (_, actionHash: ActionHashB64): Promise<String> => {
      const maybeJson = await getHierarchyForOrbit(actionHash);
      
      const json = JSON.stringify({result: maybeJson})
      return Promise.resolve(JSON.stringify(json) || "")
    },
  }
}
