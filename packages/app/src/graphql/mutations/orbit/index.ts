import { mapZomeFn } from '../../connection'
import { DNAIdMappings } from '../../types'
import { HAPP_ID, HAPP_ZOME_NAME_PERSONAL_HABITS } from '../../../constants'
import { Orbit, OrbitCreateUpdateParams } from '../../mocks/generated/index'

export type createArgs = { orbit: OrbitCreateUpdateParams }
export type createHandler = (root: any, args: createArgs) => Promise<Orbit>

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<Omit<Orbit, 'id'>, Orbit>(
    dnaConfig,
    conductorUri,
    HAPP_ID,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    'create_orbit',
  )

  const createOrbit: createHandler = async (
    _,
    { orbit: { name, startTime, endTime, ...metadata } },
  ) => {
    return runCreate({ name, timeframe: { startTime, endTime } })
  }

  return {
    createOrbit,
  }
}
