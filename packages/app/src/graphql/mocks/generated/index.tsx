import { gql } from '@apollo/client'
import * as Apollo from '@apollo/client'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
const defaultOptions = {} as const
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  DateTime: any
}

export type AgentProfile = {
  __typename?: 'AgentProfile'
  agentPubKey: Scalars['String']
  profile: Profile
}

export type Sphere = Node & {
  __typename?: 'Sphere'
  id: Scalars['ID']
  metadata?: Maybe<SphereMetaData>
  name: Scalars['String']
}

export type SphereConnection = {
  __typename?: 'SphereConnection'
  edges: Array<SphereEdge>
  pageInfo: PageInfo
}

export type SphereCreateResponse = {
  __typename?: 'SphereCreateResponse'
  payload: ResponsePayload
}

export type SphereCreateUpdateParams = {
  description: Scalars['String']
  hashtag?: InputMaybe<Scalars['String']>
  name: Scalars['String']
}

export type SphereEdge = {
  __typename?: 'SphereEdge'
  cursor: Scalars['String']
  node: Sphere
}

export type SphereMetaData = {
  __typename?: 'SphereMetaData'
  description: Scalars['String']
  hashtag?: Maybe<Scalars['String']>
}

export type Orbit = Node & {
  __typename?: 'Orbit'
  id: Scalars['ID']
  metadata?: Maybe<OrbitMetaData>
  name: Scalars['String']
  timeframe: TimeFrame
}

export type OrbitConnection = {
  __typename?: 'OrbitConnection'
  edges: Array<OrbitEdge>
  pageInfo: PageInfo
}

export type OrbitCreateResponse = {
  __typename?: 'OrbitCreateResponse'
  payload: ResponsePayload
}

export type OrbitCreateUpdateParams = {
  description: Scalars['String']
  endTime: Scalars['DateTime']
  isAtomic: Scalars['String']
  name: Scalars['String']
  startTime: Scalars['DateTime']
}

export type OrbitEdge = {
  __typename?: 'OrbitEdge'
  cursor: Scalars['String']
  node: Orbit
}

export enum Frequency {
  DAY = 'DAY',
  HOUR = 'HOUR',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
}

export enum Scale {
  SUB = 'SUB',
  ATOM = 'ATOM',
  ASTRO = 'ASTRO',
}

export type OrbitMetaData = {
  __typename?: 'OrbitMetaData'
  description: Scalars['String']
  frequency: Frequency
  scale: Scale
}

export type Mutation = {
  __typename?: 'Mutation'
  createSphere: SphereCreateResponse
  createOrbit: OrbitCreateResponse
  createProfile: AgentProfile
  updateSphere: Sphere
  updateOrbit: Orbit
  updateProfile: AgentProfile
}

export type MutationCreateSphereArgs = {
  sphere?: InputMaybe<SphereCreateUpdateParams>
}

export type MutationCreateOrbitArgs = {
  orbit?: InputMaybe<OrbitCreateUpdateParams>
}

export type MutationCreateProfileArgs = {
  profile?: InputMaybe<UserProfileCreateUpdateParams>
}

export type MutationUpdateSphereArgs = {
  sphere?: InputMaybe<SphereCreateUpdateParams>
}

export type MutationUpdateOrbitArgs = {
  orbit?: InputMaybe<OrbitCreateUpdateParams>
}

export type MutationUpdateProfileArgs = {
  profile?: InputMaybe<UserProfileCreateUpdateParams>
}

export type Node = {
  id: Scalars['ID']
}

export type PageInfo = {
  __typename?: 'PageInfo'
  endCursor: Scalars['String']
  hasNextPage: Scalars['Boolean']
  hasPreviousPage: Scalars['Boolean']
  startCursor: Scalars['String']
}

export type Profile = {
  __typename?: 'Profile'
  fields?: Maybe<ProfileFields>
  nickname: Scalars['String']
}

export type ProfileFields = {
  __typename?: 'ProfileFields'
  avatar?: Maybe<Scalars['String']>
  isPublic?: Maybe<Scalars['String']>
  location?: Maybe<Scalars['String']>
}

export type Query = {
  __typename?: 'Query'
  sphere: Sphere
  spheres: SphereConnection
  orbit: Orbit
  orbits: OrbitConnection
  me: AgentProfile
}

export type QuerySphereArgs = {
  id: Scalars['ID']
}

export type QueryOrbitArgs = {
  id: Scalars['ID']
}

export type ResponsePayload = {
  __typename?: 'ResponsePayload'
  entryHash: Scalars['String']
  headerHash: Scalars['String']
}

export type TimeFrame = {
  __typename?: 'TimeFrame'
  endTime: Scalars['DateTime']
  startTime: Scalars['DateTime']
}

export type Todo = {
  __typename?: 'Todo'
  description: Scalars['String']
  id: Scalars['ID']
  status: Scalars['Boolean']
}

export type UserProfileCreateUpdateParams = {
  avatar?: InputMaybe<Scalars['String']>
  isPublic?: InputMaybe<Scalars['String']>
  location?: InputMaybe<Scalars['String']>
  nickname: Scalars['String']
}

export type AddSphereMutationVariables = Exact<{
  variables: SphereCreateUpdateParams
}>

export type AddSphereMutation = {
  __typename?: 'Mutation'
  createSphere: {
    __typename?: 'SphereCreateResponse'
    payload: {
      __typename?: 'ResponsePayload'
      headerHash: string
      entryHash: string
    }
  }
}

export type AddOrbitMutationVariables = Exact<{
  variables: OrbitCreateUpdateParams
}>

export type AddOrbitMutation = {
  __typename?: 'Mutation'
  createOrbit: {
    __typename?: 'OrbitCreateResponse'
    payload: {
      __typename?: 'ResponsePayload'
      headerHash: string
      entryHash: string
    }
  }
}

export type UpdateOrbitMutationVariables = Exact<{
  orbitFields: OrbitCreateUpdateParams
}>

export type UpdateOrbitMutation = {
  __typename?: 'Mutation'
  updateOrbit: { __typename?: 'Orbit'; id: string }
}

export type AddUserMutationVariables = Exact<{
  profileFields: UserProfileCreateUpdateParams
}>

export type AddUserMutation = {
  __typename?: 'Mutation'
  createProfile: {
    __typename?: 'AgentProfile'
    agentPubKey: string
    profile: { __typename?: 'Profile'; nickname: string }
  }
}

export type UpdateUserMutationVariables = Exact<{
  profileFields: UserProfileCreateUpdateParams
}>

export type UpdateUserMutation = {
  __typename?: 'Mutation'
  updateProfile: {
    __typename?: 'AgentProfile'
    agentPubKey: string
    profile: { __typename?: 'Profile'; nickname: string }
  }
}

export type GetSpheresQueryVariables = Exact<{ [key: string]: never }>

export type GetSpheresQuery = {
  __typename?: 'Query'
  spheres: {
    __typename?: 'SphereConnection'
    edges: Array<{
      __typename?: 'SphereEdge'
      node: {
        __typename?: 'Sphere'
        name: string
        metadata?: { __typename?: 'SphereMetaData'; description: string } | null
      }
    }>
  }
}

export type GetOrbitQueryVariables = Exact<{
  id: Scalars['ID']
}>

export type GetOrbitQuery = {
  __typename?: 'Query'
  orbit: {
    __typename?: 'Orbit'
    name: string
    timeframe: { __typename?: 'TimeFrame'; startTime: any; endTime: any }
    metadata?: {
      __typename?: 'OrbitMetaData'
      description: string
      isAtomic: string
    } | null
  }
}

export type GetOrbitsQueryVariables = Exact<{ [key: string]: never }>

export type GetOrbitsQuery = {
  __typename?: 'Query'
  orbits: {
    __typename?: 'OrbitConnection'
    edges: Array<{
      __typename?: 'OrbitEdge'
      node: {
        __typename?: 'Orbit'
        name: string
        timeframe: { __typename?: 'TimeFrame'; startTime: any; endTime: any }
        metadata?: {
          __typename?: 'OrbitMetaData'
          description: string
          isAtomic: string
        } | null
      }
    }>
  }
}

export type GetMeQueryVariables = Exact<{ [key: string]: never }>

export type GetMeQuery = {
  __typename?: 'Query'
  me: {
    __typename?: 'AgentProfile'
    agentPubKey: string
    profile: {
      __typename?: 'Profile'
      nickname: string
      fields?: {
        __typename?: 'ProfileFields'
        avatar?: string | null
        location?: string | null
      } | null
    }
  }
}

export const AddSphereDocument = gql`
  mutation addSphere($variables: SphereCreateUpdateParams!) {
    createSphere(sphere: $variables) {
      payload {
        headerHash
        entryHash
      }
    }
  }
`
export type AddSphereMutationFn = Apollo.MutationFunction<
  AddSphereMutation,
  AddSphereMutationVariables
>

/**
 * __useAddSphereMutation__
 *
 * To run a mutation, you first call `useAddSphereMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSphereMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSphereMutation, { data, loading, error }] = useAddSphereMutation({
 *   variables: {
 *      variables: // value for 'variables'
 *   },
 * });
 */
export function useAddSphereMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddSphereMutation,
    AddSphereMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<AddSphereMutation, AddSphereMutationVariables>(
    AddSphereDocument,
    options,
  )
}
export type AddSphereMutationHookResult = ReturnType<
  typeof useAddSphereMutation
>
export type AddSphereMutationResult = Apollo.MutationResult<AddSphereMutation>
export type AddSphereMutationOptions = Apollo.BaseMutationOptions<
  AddSphereMutation,
  AddSphereMutationVariables
>
export const AddOrbitDocument = gql`
  mutation addOrbit($variables: OrbitCreateUpdateParams!) {
    createOrbit(orbit: $variables) {
      payload {
        headerHash
        entryHash
      }
    }
  }
`
export type AddOrbitMutationFn = Apollo.MutationFunction<
  AddOrbitMutation,
  AddOrbitMutationVariables
>

/**
 * __useAddOrbitMutation__
 *
 * To run a mutation, you first call `useAddOrbitMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddOrbitMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addOrbitMutation, { data, loading, error }] = useAddOrbitMutation({
 *   variables: {
 *      variables: // value for 'variables'
 *   },
 * });
 */
export function useAddOrbitMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddOrbitMutation,
    AddOrbitMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<AddOrbitMutation, AddOrbitMutationVariables>(
    AddOrbitDocument,
    options,
  )
}
export type AddOrbitMutationHookResult = ReturnType<typeof useAddOrbitMutation>
export type AddOrbitMutationResult = Apollo.MutationResult<AddOrbitMutation>
export type AddOrbitMutationOptions = Apollo.BaseMutationOptions<
  AddOrbitMutation,
  AddOrbitMutationVariables
>
export const UpdateOrbitDocument = gql`
  mutation updateOrbit($orbitFields: OrbitCreateUpdateParams!) {
    updateOrbit(orbit: $orbitFields) {
      id
    }
  }
`
export type UpdateOrbitMutationFn = Apollo.MutationFunction<
  UpdateOrbitMutation,
  UpdateOrbitMutationVariables
>

/**
 * __useUpdateOrbitMutation__
 *
 * To run a mutation, you first call `useUpdateOrbitMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrbitMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrbitMutation, { data, loading, error }] = useUpdateOrbitMutation({
 *   variables: {
 *      orbitFields: // value for 'orbitFields'
 *   },
 * });
 */
export function useUpdateOrbitMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateOrbitMutation,
    UpdateOrbitMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<UpdateOrbitMutation, UpdateOrbitMutationVariables>(
    UpdateOrbitDocument,
    options,
  )
}
export type UpdateOrbitMutationHookResult = ReturnType<
  typeof useUpdateOrbitMutation
>
export type UpdateOrbitMutationResult =
  Apollo.MutationResult<UpdateOrbitMutation>
export type UpdateOrbitMutationOptions = Apollo.BaseMutationOptions<
  UpdateOrbitMutation,
  UpdateOrbitMutationVariables
>
export const AddUserDocument = gql`
  mutation addUser($profileFields: UserProfileCreateUpdateParams!) {
    createProfile(profile: $profileFields) {
      agentPubKey
      profile {
        nickname
      }
    }
  }
`
export type AddUserMutationFn = Apollo.MutationFunction<
  AddUserMutation,
  AddUserMutationVariables
>

/**
 * __useAddUserMutation__
 *
 * To run a mutation, you first call `useAddUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserMutation, { data, loading, error }] = useAddUserMutation({
 *   variables: {
 *      profileFields: // value for 'profileFields'
 *   },
 * });
 */
export function useAddUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddUserMutation,
    AddUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<AddUserMutation, AddUserMutationVariables>(
    AddUserDocument,
    options,
  )
}
export type AddUserMutationHookResult = ReturnType<typeof useAddUserMutation>
export type AddUserMutationResult = Apollo.MutationResult<AddUserMutation>
export type AddUserMutationOptions = Apollo.BaseMutationOptions<
  AddUserMutation,
  AddUserMutationVariables
>
export const UpdateUserDocument = gql`
  mutation updateUser($profileFields: UserProfileCreateUpdateParams!) {
    updateProfile(profile: $profileFields) {
      agentPubKey
      profile {
        nickname
      }
    }
  }
`
export type UpdateUserMutationFn = Apollo.MutationFunction<
  UpdateUserMutation,
  UpdateUserMutationVariables
>

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      profileFields: // value for 'profileFields'
 *   },
 * });
 */
export function useUpdateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(
    UpdateUserDocument,
    options,
  )
}
export type UpdateUserMutationHookResult = ReturnType<
  typeof useUpdateUserMutation
>
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserMutation,
  UpdateUserMutationVariables
>
export const GetSpheresDocument = gql`
  query getSpheres {
    spheres {
      edges {
        node {
          name
          metadata {
            description
          }
        }
      }
    }
  }
`

/**
 * __useGetSpheresQuery__
 *
 * To run a query within a React component, call `useGetSpheresQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSpheresQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSpheresQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSpheresQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSpheresQuery,
    GetSpheresQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetSpheresQuery, GetSpheresQueryVariables>(
    GetSpheresDocument,
    options,
  )
}
export function useGetSpheresLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSpheresQuery,
    GetSpheresQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetSpheresQuery, GetSpheresQueryVariables>(
    GetSpheresDocument,
    options,
  )
}
export type GetSpheresQueryHookResult = ReturnType<typeof useGetSpheresQuery>
export type GetSpheresLazyQueryHookResult = ReturnType<
  typeof useGetSpheresLazyQuery
>
export type GetSpheresQueryResult = Apollo.QueryResult<
  GetSpheresQuery,
  GetSpheresQueryVariables
>
export const GetOrbitDocument = gql`
  query getOrbit($id: ID!) {
    orbit(id: $id) {
      name
      timeframe {
        startTime
        endTime
      }
      metadata {
        description
        isAtomic
      }
    }
  }
`

/**
 * __useGetOrbitQuery__
 *
 * To run a query within a React component, call `useGetOrbitQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrbitQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrbitQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrbitQuery(
  baseOptions: Apollo.QueryHookOptions<GetOrbitQuery, GetOrbitQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetOrbitQuery, GetOrbitQueryVariables>(
    GetOrbitDocument,
    options,
  )
}
export function useGetOrbitLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrbitQuery,
    GetOrbitQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetOrbitQuery, GetOrbitQueryVariables>(
    GetOrbitDocument,
    options,
  )
}
export type GetOrbitQueryHookResult = ReturnType<typeof useGetOrbitQuery>
export type GetOrbitLazyQueryHookResult = ReturnType<
  typeof useGetOrbitLazyQuery
>
export type GetOrbitQueryResult = Apollo.QueryResult<
  GetOrbitQuery,
  GetOrbitQueryVariables
>
export const GetOrbitsDocument = gql`
  query getOrbits {
    orbits {
      edges {
        node {
          name
          timeframe {
            startTime
            endTime
          }
          metadata {
            description
            isAtomic
          }
        }
      }
    }
  }
`

/**
 * __useGetOrbitsQuery__
 *
 * To run a query within a React component, call `useGetOrbitsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrbitsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrbitsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOrbitsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetOrbitsQuery,
    GetOrbitsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetOrbitsQuery, GetOrbitsQueryVariables>(
    GetOrbitsDocument,
    options,
  )
}
export function useGetOrbitsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrbitsQuery,
    GetOrbitsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetOrbitsQuery, GetOrbitsQueryVariables>(
    GetOrbitsDocument,
    options,
  )
}
export type GetOrbitsQueryHookResult = ReturnType<typeof useGetOrbitsQuery>
export type GetOrbitsLazyQueryHookResult = ReturnType<
  typeof useGetOrbitsLazyQuery
>
export type GetOrbitsQueryResult = Apollo.QueryResult<
  GetOrbitsQuery,
  GetOrbitsQueryVariables
>
export const GetMeDocument = gql`
  query getMe {
    me {
      agentPubKey
      profile {
        nickname
        fields {
          avatar
          location
        }
      }
    }
  }
`

/**
 * __useGetMeQuery__
 *
 * To run a query within a React component, call `useGetMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMeQuery(
  baseOptions?: Apollo.QueryHookOptions<GetMeQuery, GetMeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetMeQuery, GetMeQueryVariables>(
    GetMeDocument,
    options,
  )
}
export function useGetMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetMeQuery, GetMeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetMeQuery, GetMeQueryVariables>(
    GetMeDocument,
    options,
  )
}
export type GetMeQueryHookResult = ReturnType<typeof useGetMeQuery>
export type GetMeLazyQueryHookResult = ReturnType<typeof useGetMeLazyQuery>
export type GetMeQueryResult = Apollo.QueryResult<
  GetMeQuery,
  GetMeQueryVariables
>
