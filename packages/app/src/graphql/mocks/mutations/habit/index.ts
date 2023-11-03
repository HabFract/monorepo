import { mapZomeFn } from '../../connection'
import { DNAIdMappings } from '../../types'
import { HAPP_ID, HAPP_ZOME_NAME_ATOMIC } from '@/app/constants'
import { Habit, HabitCreateUpdateParams } from '@/graphql/generated/index'

export type createArgs = { habit: HabitCreateUpdateParams }
export type createHandler = (root: any, args: createArgs) => Promise<Habit>

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<Omit<Habit, 'id'>, Habit>(
    dnaConfig,
    conductorUri,
    HAPP_ID,
    HAPP_ZOME_NAME_ATOMIC,
    'create_habit',
  )

  const createHabit: createHandler = async (
    _,
    { habit: { name, startTime, endTime, ...metadata } },
  ) => {
    return runCreate({ name, timeframe: { startTime, endTime }, metadata })
  }

  return {
    createHabit,
  }
}
