import { mapZomeFn } from '../../connection'
import { DNAIdMappings } from '../../types'
import { HAPP_ID, HAPP_ZOME_NAME_PROFILES } from '@/app/constants'
import {
  AgentProfile,
  Profile,
  UserProfileCreateUpdateParams,
} from '@/graphql/generated/index'

export type createArgs = { profile: UserProfileCreateUpdateParams }
export type updateArgs = { profile: UserProfileCreateUpdateParams }
export type createHandler = (
  root: any,
  args: createArgs,
) => Promise<AgentProfile>
export type updateHandler = (
  root: any,
  args: updateArgs,
) => Promise<AgentProfile>

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<Profile, AgentProfile>(
    dnaConfig,
    conductorUri,
    HAPP_ID,
    HAPP_ZOME_NAME_PROFILES,
    'create_profile',
    false,
  )
  const runUpdate = mapZomeFn<Profile, AgentProfile>(
    dnaConfig,
    conductorUri,
    HAPP_ID,
    HAPP_ZOME_NAME_PROFILES,
    'update_profile',
    false,
  )

  const createProfile: createHandler = async (
    _,
    { profile: { nickname, location, avatar, isPublic } },
  ) => {
    console.log('nickname, location, avatar :>> ', nickname, location, avatar)
    return runCreate({ nickname, fields: { location, avatar } })
  }
  const updateProfile: updateHandler = async (
    _,
    { profile: { nickname, location, avatar, isPublic } },
  ) => {
    return runUpdate({ nickname, fields: { location, avatar } })
  }

  return {
    createProfile,
    updateProfile,
  }
}
