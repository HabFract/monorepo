import { mapZomeFn } from '../../connection'
import { DNAIdMappings, ById } from '../../types'
import { HAPP_ID, HAPP_ZOME_NAME_PROFILES } from '@/app/constants'
import { AgentProfile } from '@/graphql/generated/index'

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const readMe = mapZomeFn<null, AgentProfile>(
    dnaConfig,
    conductorUri,
    HAPP_ID,
    HAPP_ZOME_NAME_PROFILES,
    'get_my_profile',
  )
  const read = mapZomeFn<ById, AgentProfile>(
    dnaConfig,
    conductorUri,
    HAPP_ID,
    HAPP_ZOME_NAME_PROFILES,
    'get_agent_profile',
  )
  const readAll = mapZomeFn<null, AgentProfile[]>(
    dnaConfig,
    conductorUri,
    HAPP_ID,
    HAPP_ZOME_NAME_PROFILES,
    'get_all_profiles',
  )

  return {
    me: async (_: any): Promise<AgentProfile> => {
      const maybeProfile = await readMe(null)
      const blankAgent: AgentProfile = {
        agentPubKey: '',
        profile: { nickname: '', fields: undefined },
      }
      return Promise.resolve(maybeProfile || blankAgent)
    },

    // user: async (_, args): Promise<Habit> => {
    //   console.log('args :>> ', args)
    //   return read(args.id)
    // },

    // users: async (): Promise<Habit[]> => {
    //   return readAll(null)
    // },
  }
}
