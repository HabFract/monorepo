import type { DocumentNode } from "graphql/language/ast";
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Query = {
  __typename?: 'Query';
  sphere: Sphere;
  spheres: SphereConnection;
  orbit: Orbit;
  orbits: OrbitConnection;
  getOrbitHierarchy: Scalars['String']['output'];
  getLowestSphereHierarchyLevel: Scalars['Int']['output'];
  getWinRecordForOrbitForMonth?: Maybe<WinRecord>;
  winRecords: Array<WinRecord>;
  me: AgentProfile;
};


export type QuerySphereArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrbitArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrbitsArgs = {
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetOrbitHierarchyArgs = {
  params: OrbitHierarchyQueryParams;
};


export type QueryGetLowestSphereHierarchyLevelArgs = {
  sphereEntryHashB64: Scalars['String']['input'];
};


export type QueryGetWinRecordForOrbitForMonthArgs = {
  params?: InputMaybe<OrbitWinRecordQueryParams>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createSphere: CreateSphereResponsePayload;
  updateSphere: CreateSphereResponsePayload;
  deleteSphere: Scalars['ID']['output'];
  createOrbit: CreateOrbitResponsePayload;
  updateOrbit: UpdateOrbitResponsePayload;
  deleteOrbit: Scalars['ID']['output'];
  createProfile: AgentProfile;
  updateProfile: AgentProfile;
  createWinRecord: WinRecord;
  updateWinRecord: WinRecord;
};


export type MutationCreateSphereArgs = {
  sphere?: InputMaybe<SphereCreateParams>;
};


export type MutationUpdateSphereArgs = {
  sphere?: InputMaybe<SphereUpdateParams>;
};


export type MutationDeleteSphereArgs = {
  sphereHash: Scalars['ID']['input'];
};


export type MutationCreateOrbitArgs = {
  orbit?: InputMaybe<OrbitCreateParams>;
};


export type MutationUpdateOrbitArgs = {
  orbit?: InputMaybe<OrbitUpdateParams>;
};


export type MutationDeleteOrbitArgs = {
  orbitHash: Scalars['ID']['input'];
};


export type MutationCreateProfileArgs = {
  profile?: InputMaybe<UserProfileCreateUpdateParams>;
};


export type MutationUpdateProfileArgs = {
  profile?: InputMaybe<UserProfileCreateUpdateParams>;
};


export type MutationCreateWinRecordArgs = {
  winRecord: WinRecordCreateParams;
};


export type MutationUpdateWinRecordArgs = {
  winRecord: WinRecordUpdateParams;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Scalars['String']['output'];
  endCursor: Scalars['String']['output'];
};

export type Node = {
  id: Scalars['ID']['output'];
  eH: Scalars['String']['output'];
};

export type CreateSphereResponsePayload = {
  __typename?: 'CreateSphereResponsePayload';
  id: Scalars['ID']['output'];
  actionHash: Scalars['String']['output'];
  entryHash: Scalars['String']['output'];
  eH: Scalars['String']['output'];
  name: Scalars['String']['output'];
  metadata?: Maybe<SphereMetaData>;
};

export type CreateOrbitResponsePayload = {
  __typename?: 'CreateOrbitResponsePayload';
  id: Scalars['ID']['output'];
  eH: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sphereHash: Scalars['String']['output'];
  parentHash?: Maybe<Scalars['String']['output']>;
  childHash?: Maybe<Scalars['String']['output']>;
  frequency: Frequency;
  scale: Scale;
  metadata?: Maybe<OrbitMetaData>;
};

export type UpdateOrbitResponsePayload = {
  __typename?: 'UpdateOrbitResponsePayload';
  id: Scalars['ID']['output'];
  eH: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sphereHash: Scalars['String']['output'];
  parentHash?: Maybe<Scalars['String']['output']>;
  childHash?: Maybe<Scalars['String']['output']>;
  frequency: Frequency;
  scale: Scale;
  metadata?: Maybe<OrbitMetaData>;
};

export type AgentProfile = {
  __typename?: 'AgentProfile';
  agentPubKey: Scalars['String']['output'];
  profile: Profile;
};

export type Profile = {
  __typename?: 'Profile';
  nickname: Scalars['String']['output'];
  fields?: Maybe<ProfileFields>;
};

export type ProfileFields = {
  __typename?: 'ProfileFields';
  location?: Maybe<Scalars['String']['output']>;
  isPublic?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
};

export type UserProfileCreateUpdateParams = {
  nickname: Scalars['String']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['String']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
};

export type SphereConnection = {
  __typename?: 'SphereConnection';
  edges: Array<SphereEdge>;
  pageInfo: PageInfo;
};

export type SphereEdge = {
  __typename?: 'SphereEdge';
  cursor: Scalars['String']['output'];
  node: Sphere;
};

export type Sphere = Node & {
  __typename?: 'Sphere';
  id: Scalars['ID']['output'];
  eH: Scalars['String']['output'];
  name: Scalars['String']['output'];
  metadata?: Maybe<SphereMetaData>;
};

export type SphereMetaData = {
  __typename?: 'SphereMetaData';
  description: Scalars['String']['output'];
  hashtag?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
};

export type SphereCreateParams = {
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  hashtag?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
};

export type SphereUpdateParams = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  hashtag?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
};

export type OrbitConnection = {
  __typename?: 'OrbitConnection';
  edges: Array<OrbitEdge>;
  pageInfo: PageInfo;
};

export type OrbitEdge = {
  __typename?: 'OrbitEdge';
  cursor: Scalars['String']['output'];
  node: Orbit;
};

export type Orbit = Node & {
  __typename?: 'Orbit';
  id: Scalars['ID']['output'];
  eH: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sphereHash: Scalars['String']['output'];
  parentHash?: Maybe<Scalars['String']['output']>;
  childHash?: Maybe<Scalars['String']['output']>;
  frequency: Frequency;
  scale: Scale;
  metadata?: Maybe<OrbitMetaData>;
};

export type TimeFrame = {
  __typename?: 'TimeFrame';
  startTime: Scalars['Float']['output'];
  endTime?: Maybe<Scalars['Float']['output']>;
};

export enum Frequency {
  OneShot = 'ONE_SHOT',
  DailyOrMore_1d = 'DAILY_OR_MORE_1d',
  DailyOrMore_2d = 'DAILY_OR_MORE_2d',
  DailyOrMore_3d = 'DAILY_OR_MORE_3d',
  DailyOrMore_4d = 'DAILY_OR_MORE_4d',
  DailyOrMore_5d = 'DAILY_OR_MORE_5d',
  DailyOrMore_6d = 'DAILY_OR_MORE_6d',
  DailyOrMore_7d = 'DAILY_OR_MORE_7d',
  DailyOrMore_8d = 'DAILY_OR_MORE_8d',
  DailyOrMore_9d = 'DAILY_OR_MORE_9d',
  DailyOrMore_10d = 'DAILY_OR_MORE_10d',
  LessThanDaily_1w = 'LESS_THAN_DAILY_1w',
  LessThanDaily_1m = 'LESS_THAN_DAILY_1m',
  LessThanDaily_1q = 'LESS_THAN_DAILY_1q'
}

export enum Scale {
  Astro = 'Astro',
  Sub = 'Sub',
  Atom = 'Atom'
}

export type OrbitMetaData = {
  __typename?: 'OrbitMetaData';
  description?: Maybe<Scalars['String']['output']>;
  timeframe: TimeFrame;
};

export type OrbitCreateParams = {
  name: Scalars['String']['input'];
  startTime: Scalars['Float']['input'];
  endTime?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  frequency: Frequency;
  scale: Scale;
  sphereHash: Scalars['String']['input'];
  parentHash?: InputMaybe<Scalars['String']['input']>;
  childHash?: InputMaybe<Scalars['String']['input']>;
};

export type OrbitUpdateParams = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  startTime: Scalars['Float']['input'];
  endTime?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  frequency: Frequency;
  scale: Scale;
  sphereHash: Scalars['String']['input'];
  parentHash?: InputMaybe<Scalars['String']['input']>;
};

export type OrbitHierarchyQueryParams = {
  orbitEntryHashB64?: InputMaybe<Scalars['String']['input']>;
  levelQuery?: InputMaybe<QueryParamsLevel>;
};

export type QueryParamsLevel = {
  sphereHashB64?: InputMaybe<Scalars['String']['input']>;
  orbitLevel: Scalars['Float']['input'];
};

export type WinRecord = {
  __typename?: 'WinRecord';
  id: Scalars['ID']['output'];
  eH: Scalars['String']['output'];
  orbitId: Scalars['ID']['output'];
  winData: Array<WinDateEntry>;
};

export type WinDateEntry = {
  __typename?: 'WinDateEntry';
  date: Scalars['String']['output'];
  value: WinDateValue;
};

export type WinDateValue = SingleWin | MultipleWins;

export type SingleWin = {
  __typename?: 'SingleWin';
  single: Scalars['Boolean']['output'];
};

export type MultipleWins = {
  __typename?: 'MultipleWins';
  multiple: Array<Scalars['Boolean']['output']>;
};

export type OrbitWinRecordQueryParams = {
  orbitEh: Scalars['String']['input'];
  yearDotMonth: Scalars['String']['input'];
};

export type WinRecordCreateParams = {
  orbitEh: Scalars['String']['input'];
  winData: Array<WinDateEntryInput>;
};

export type WinRecordUpdateParams = {
  winRecordId: Scalars['ID']['input'];
  updatedWinRecord?: InputMaybe<WinRecordCreateParams>;
};

export type WinDateEntryInput = {
  date: Scalars['String']['input'];
  single?: InputMaybe<Scalars['Boolean']['input']>;
  multiple?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export type CreateOrbitMutationVariables = Exact<{
  variables: OrbitCreateParams;
}>;


export type CreateOrbitMutation = { __typename?: 'Mutation', createOrbit: { __typename?: 'CreateOrbitResponsePayload', id: string, eH: string, name: string, parentHash?: string | null, sphereHash: string, scale: Scale, frequency: Frequency, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, timeframe: { __typename?: 'TimeFrame', startTime: number, endTime?: number | null } } | null } };

export type GetOrbitsQueryVariables = Exact<{
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitsQuery = { __typename?: 'Query', orbits: { __typename?: 'OrbitConnection', edges: Array<{ __typename?: 'OrbitEdge', node: { __typename?: 'Orbit', id: string, eH: string, name: string, sphereHash: string, parentHash?: string | null, frequency: Frequency, scale: Scale, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, timeframe: { __typename?: 'TimeFrame', startTime: number, endTime?: number | null } } | null } }> } };

export type DeleteOrbitMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteOrbitMutation = { __typename?: 'Mutation', deleteOrbit: string };

export type GetLowestSphereHierarchyLevelQueryVariables = Exact<{
  sphereEntryHashB64: Scalars['String']['input'];
}>;


export type GetLowestSphereHierarchyLevelQuery = { __typename?: 'Query', getLowestSphereHierarchyLevel: number };

export type UpdateSphereMutationVariables = Exact<{
  sphere: SphereUpdateParams;
}>;


export type UpdateSphereMutation = { __typename?: 'Mutation', updateSphere: { __typename?: 'CreateSphereResponsePayload', actionHash: string, entryHash: string } };

export type CreateSphereMutationVariables = Exact<{
  variables: SphereCreateParams;
}>;


export type CreateSphereMutation = { __typename?: 'Mutation', createSphere: { __typename?: 'CreateSphereResponsePayload', actionHash: string, entryHash: string, name: string } };

export type CreateWinRecordMutationVariables = Exact<{
  winRecord: WinRecordCreateParams;
}>;


export type CreateWinRecordMutation = { __typename?: 'Mutation', createWinRecord: { __typename?: 'WinRecord', id: string, eH: string, winData: Array<{ __typename?: 'WinDateEntry', date: string, value: { __typename?: 'SingleWin', single: boolean } | { __typename?: 'MultipleWins', multiple: Array<boolean> } }> } };

export type GetWinRecordForOrbitForMonthQueryVariables = Exact<{
  params: OrbitWinRecordQueryParams;
}>;


export type GetWinRecordForOrbitForMonthQuery = { __typename?: 'Query', getWinRecordForOrbitForMonth?: { __typename?: 'WinRecord', id: string, eH: string, winData: Array<{ __typename?: 'WinDateEntry', date: string, value: { __typename?: 'SingleWin', single: boolean } | { __typename?: 'MultipleWins', multiple: Array<boolean> } }> } | null };

export type GetSpheresQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSpheresQuery = { __typename?: 'Query', spheres: { __typename?: 'SphereConnection', edges: Array<{ __typename?: 'SphereEdge', node: { __typename?: 'Sphere', id: string, eH: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, image?: string | null } | null } }> } };

export type GetOrbitHierarchyQueryVariables = Exact<{
  params: OrbitHierarchyQueryParams;
}>;


export type GetOrbitHierarchyQuery = { __typename?: 'Query', getOrbitHierarchy: string };

export type GetSphereQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSphereQuery = { __typename?: 'Query', sphere: { __typename?: 'Sphere', id: string, eH: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, image?: string | null } | null } };

export type UpdateOrbitMutationVariables = Exact<{
  orbitFields: OrbitUpdateParams;
}>;


export type UpdateOrbitMutation = { __typename?: 'Mutation', updateOrbit: { __typename?: 'UpdateOrbitResponsePayload', id: string, eH: string, name: string, parentHash?: string | null, sphereHash: string, scale: Scale, frequency: Frequency, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, timeframe: { __typename?: 'TimeFrame', startTime: number, endTime?: number | null } } | null } };

export type GetOrbitQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOrbitQuery = { __typename?: 'Query', orbit: { __typename?: 'Orbit', id: string, eH: string, name: string, sphereHash: string, frequency: Frequency, scale: Scale, parentHash?: string | null, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, timeframe: { __typename?: 'TimeFrame', startTime: number, endTime?: number | null } } | null } };

export type UpdateWinRecordMutationVariables = Exact<{
  winRecord: WinRecordUpdateParams;
}>;


export type UpdateWinRecordMutation = { __typename?: 'Mutation', updateWinRecord: { __typename?: 'WinRecord', id: string, eH: string, orbitId: string, winData: Array<{ __typename?: 'WinDateEntry', date: string, value: { __typename?: 'SingleWin', single: boolean } | { __typename?: 'MultipleWins', multiple: Array<boolean> } }> } };

export type DeleteSphereMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSphereMutation = { __typename?: 'Mutation', deleteSphere: string };


export const CreateOrbitDocument = gql`
    mutation createOrbit($variables: OrbitCreateParams!) {
  createOrbit(orbit: $variables) {
    id
    eH
    name
    parentHash
    sphereHash
    scale
    frequency
    metadata {
      description
      timeframe {
        startTime
        endTime
      }
    }
  }
}
    `;
export type CreateOrbitMutationFn = Apollo.MutationFunction<CreateOrbitMutation, CreateOrbitMutationVariables>;

/**
 * __useCreateOrbitMutation__
 *
 * To run a mutation, you first call `useCreateOrbitMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrbitMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrbitMutation, { data, loading, error }] = useCreateOrbitMutation({
 *   variables: {
 *      variables: // value for 'variables'
 *   },
 * });
 */
export function useCreateOrbitMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrbitMutation, CreateOrbitMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrbitMutation, CreateOrbitMutationVariables>(CreateOrbitDocument, options);
      }
export type CreateOrbitMutationHookResult = ReturnType<typeof useCreateOrbitMutation>;
export type CreateOrbitMutationResult = Apollo.MutationResult<CreateOrbitMutation>;
export type CreateOrbitMutationOptions = Apollo.BaseMutationOptions<CreateOrbitMutation, CreateOrbitMutationVariables>;
export const GetOrbitsDocument = gql`
    query getOrbits($sphereEntryHashB64: String) {
  orbits(sphereEntryHashB64: $sphereEntryHashB64) {
    edges {
      node {
        id
        eH
        name
        sphereHash
        parentHash
        frequency
        scale
        metadata {
          description
          timeframe {
            startTime
            endTime
          }
        }
      }
    }
  }
}
    `;

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
 *      sphereEntryHashB64: // value for 'sphereEntryHashB64'
 *   },
 * });
 */
export function useGetOrbitsQuery(baseOptions?: Apollo.QueryHookOptions<GetOrbitsQuery, GetOrbitsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrbitsQuery, GetOrbitsQueryVariables>(GetOrbitsDocument, options);
      }
export function useGetOrbitsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrbitsQuery, GetOrbitsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrbitsQuery, GetOrbitsQueryVariables>(GetOrbitsDocument, options);
        }
export function useGetOrbitsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrbitsQuery, GetOrbitsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrbitsQuery, GetOrbitsQueryVariables>(GetOrbitsDocument, options);
        }
export type GetOrbitsQueryHookResult = ReturnType<typeof useGetOrbitsQuery>;
export type GetOrbitsLazyQueryHookResult = ReturnType<typeof useGetOrbitsLazyQuery>;
export type GetOrbitsSuspenseQueryHookResult = ReturnType<typeof useGetOrbitsSuspenseQuery>;
export type GetOrbitsQueryResult = Apollo.QueryResult<GetOrbitsQuery, GetOrbitsQueryVariables>;
export const DeleteOrbitDocument = gql`
    mutation deleteOrbit($id: ID!) {
  deleteOrbit(orbitHash: $id)
}
    `;
export type DeleteOrbitMutationFn = Apollo.MutationFunction<DeleteOrbitMutation, DeleteOrbitMutationVariables>;

/**
 * __useDeleteOrbitMutation__
 *
 * To run a mutation, you first call `useDeleteOrbitMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOrbitMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOrbitMutation, { data, loading, error }] = useDeleteOrbitMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteOrbitMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOrbitMutation, DeleteOrbitMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOrbitMutation, DeleteOrbitMutationVariables>(DeleteOrbitDocument, options);
      }
export type DeleteOrbitMutationHookResult = ReturnType<typeof useDeleteOrbitMutation>;
export type DeleteOrbitMutationResult = Apollo.MutationResult<DeleteOrbitMutation>;
export type DeleteOrbitMutationOptions = Apollo.BaseMutationOptions<DeleteOrbitMutation, DeleteOrbitMutationVariables>;
export const GetLowestSphereHierarchyLevelDocument = gql`
    query getLowestSphereHierarchyLevel($sphereEntryHashB64: String!) {
  getLowestSphereHierarchyLevel(sphereEntryHashB64: $sphereEntryHashB64)
}
    `;

/**
 * __useGetLowestSphereHierarchyLevelQuery__
 *
 * To run a query within a React component, call `useGetLowestSphereHierarchyLevelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLowestSphereHierarchyLevelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLowestSphereHierarchyLevelQuery({
 *   variables: {
 *      sphereEntryHashB64: // value for 'sphereEntryHashB64'
 *   },
 * });
 */
export function useGetLowestSphereHierarchyLevelQuery(baseOptions: Apollo.QueryHookOptions<GetLowestSphereHierarchyLevelQuery, GetLowestSphereHierarchyLevelQueryVariables> & ({ variables: GetLowestSphereHierarchyLevelQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLowestSphereHierarchyLevelQuery, GetLowestSphereHierarchyLevelQueryVariables>(GetLowestSphereHierarchyLevelDocument, options);
      }
export function useGetLowestSphereHierarchyLevelLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLowestSphereHierarchyLevelQuery, GetLowestSphereHierarchyLevelQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLowestSphereHierarchyLevelQuery, GetLowestSphereHierarchyLevelQueryVariables>(GetLowestSphereHierarchyLevelDocument, options);
        }
export function useGetLowestSphereHierarchyLevelSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLowestSphereHierarchyLevelQuery, GetLowestSphereHierarchyLevelQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLowestSphereHierarchyLevelQuery, GetLowestSphereHierarchyLevelQueryVariables>(GetLowestSphereHierarchyLevelDocument, options);
        }
export type GetLowestSphereHierarchyLevelQueryHookResult = ReturnType<typeof useGetLowestSphereHierarchyLevelQuery>;
export type GetLowestSphereHierarchyLevelLazyQueryHookResult = ReturnType<typeof useGetLowestSphereHierarchyLevelLazyQuery>;
export type GetLowestSphereHierarchyLevelSuspenseQueryHookResult = ReturnType<typeof useGetLowestSphereHierarchyLevelSuspenseQuery>;
export type GetLowestSphereHierarchyLevelQueryResult = Apollo.QueryResult<GetLowestSphereHierarchyLevelQuery, GetLowestSphereHierarchyLevelQueryVariables>;
export const UpdateSphereDocument = gql`
    mutation updateSphere($sphere: SphereUpdateParams!) {
  updateSphere(sphere: $sphere) {
    actionHash
    entryHash
  }
}
    `;
export type UpdateSphereMutationFn = Apollo.MutationFunction<UpdateSphereMutation, UpdateSphereMutationVariables>;

/**
 * __useUpdateSphereMutation__
 *
 * To run a mutation, you first call `useUpdateSphereMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSphereMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSphereMutation, { data, loading, error }] = useUpdateSphereMutation({
 *   variables: {
 *      sphere: // value for 'sphere'
 *   },
 * });
 */
export function useUpdateSphereMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSphereMutation, UpdateSphereMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSphereMutation, UpdateSphereMutationVariables>(UpdateSphereDocument, options);
      }
export type UpdateSphereMutationHookResult = ReturnType<typeof useUpdateSphereMutation>;
export type UpdateSphereMutationResult = Apollo.MutationResult<UpdateSphereMutation>;
export type UpdateSphereMutationOptions = Apollo.BaseMutationOptions<UpdateSphereMutation, UpdateSphereMutationVariables>;
export const CreateSphereDocument = gql`
    mutation createSphere($variables: SphereCreateParams!) {
  createSphere(sphere: $variables) {
    actionHash
    entryHash
    name
  }
}
    `;
export type CreateSphereMutationFn = Apollo.MutationFunction<CreateSphereMutation, CreateSphereMutationVariables>;

/**
 * __useCreateSphereMutation__
 *
 * To run a mutation, you first call `useCreateSphereMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSphereMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSphereMutation, { data, loading, error }] = useCreateSphereMutation({
 *   variables: {
 *      variables: // value for 'variables'
 *   },
 * });
 */
export function useCreateSphereMutation(baseOptions?: Apollo.MutationHookOptions<CreateSphereMutation, CreateSphereMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSphereMutation, CreateSphereMutationVariables>(CreateSphereDocument, options);
      }
export type CreateSphereMutationHookResult = ReturnType<typeof useCreateSphereMutation>;
export type CreateSphereMutationResult = Apollo.MutationResult<CreateSphereMutation>;
export type CreateSphereMutationOptions = Apollo.BaseMutationOptions<CreateSphereMutation, CreateSphereMutationVariables>;
export const CreateWinRecordDocument = gql`
    mutation createWinRecord($winRecord: WinRecordCreateParams!) {
  createWinRecord(winRecord: $winRecord) {
    id
    eH
    winData {
      date
      value {
        ... on SingleWin {
          single
        }
        ... on MultipleWins {
          multiple
        }
      }
    }
  }
}
    `;
export type CreateWinRecordMutationFn = Apollo.MutationFunction<CreateWinRecordMutation, CreateWinRecordMutationVariables>;

/**
 * __useCreateWinRecordMutation__
 *
 * To run a mutation, you first call `useCreateWinRecordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWinRecordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWinRecordMutation, { data, loading, error }] = useCreateWinRecordMutation({
 *   variables: {
 *      winRecord: // value for 'winRecord'
 *   },
 * });
 */
export function useCreateWinRecordMutation(baseOptions?: Apollo.MutationHookOptions<CreateWinRecordMutation, CreateWinRecordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWinRecordMutation, CreateWinRecordMutationVariables>(CreateWinRecordDocument, options);
      }
export type CreateWinRecordMutationHookResult = ReturnType<typeof useCreateWinRecordMutation>;
export type CreateWinRecordMutationResult = Apollo.MutationResult<CreateWinRecordMutation>;
export type CreateWinRecordMutationOptions = Apollo.BaseMutationOptions<CreateWinRecordMutation, CreateWinRecordMutationVariables>;
export const GetWinRecordForOrbitForMonthDocument = gql`
    query getWinRecordForOrbitForMonth($params: OrbitWinRecordQueryParams!) {
  getWinRecordForOrbitForMonth(params: $params) {
    id
    eH
    winData {
      date
      value {
        ... on SingleWin {
          single
        }
        ... on MultipleWins {
          multiple
        }
      }
    }
  }
}
    `;

/**
 * __useGetWinRecordForOrbitForMonthQuery__
 *
 * To run a query within a React component, call `useGetWinRecordForOrbitForMonthQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWinRecordForOrbitForMonthQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWinRecordForOrbitForMonthQuery({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetWinRecordForOrbitForMonthQuery(baseOptions: Apollo.QueryHookOptions<GetWinRecordForOrbitForMonthQuery, GetWinRecordForOrbitForMonthQueryVariables> & ({ variables: GetWinRecordForOrbitForMonthQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWinRecordForOrbitForMonthQuery, GetWinRecordForOrbitForMonthQueryVariables>(GetWinRecordForOrbitForMonthDocument, options);
      }
export function useGetWinRecordForOrbitForMonthLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWinRecordForOrbitForMonthQuery, GetWinRecordForOrbitForMonthQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWinRecordForOrbitForMonthQuery, GetWinRecordForOrbitForMonthQueryVariables>(GetWinRecordForOrbitForMonthDocument, options);
        }
export function useGetWinRecordForOrbitForMonthSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWinRecordForOrbitForMonthQuery, GetWinRecordForOrbitForMonthQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWinRecordForOrbitForMonthQuery, GetWinRecordForOrbitForMonthQueryVariables>(GetWinRecordForOrbitForMonthDocument, options);
        }
export type GetWinRecordForOrbitForMonthQueryHookResult = ReturnType<typeof useGetWinRecordForOrbitForMonthQuery>;
export type GetWinRecordForOrbitForMonthLazyQueryHookResult = ReturnType<typeof useGetWinRecordForOrbitForMonthLazyQuery>;
export type GetWinRecordForOrbitForMonthSuspenseQueryHookResult = ReturnType<typeof useGetWinRecordForOrbitForMonthSuspenseQuery>;
export type GetWinRecordForOrbitForMonthQueryResult = Apollo.QueryResult<GetWinRecordForOrbitForMonthQuery, GetWinRecordForOrbitForMonthQueryVariables>;
export const GetSpheresDocument = gql`
    query getSpheres {
  spheres {
    edges {
      node {
        id
        eH
        name
        metadata {
          description
          image
        }
      }
    }
  }
}
    `;

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
export function useGetSpheresQuery(baseOptions?: Apollo.QueryHookOptions<GetSpheresQuery, GetSpheresQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSpheresQuery, GetSpheresQueryVariables>(GetSpheresDocument, options);
      }
export function useGetSpheresLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSpheresQuery, GetSpheresQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSpheresQuery, GetSpheresQueryVariables>(GetSpheresDocument, options);
        }
export function useGetSpheresSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSpheresQuery, GetSpheresQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSpheresQuery, GetSpheresQueryVariables>(GetSpheresDocument, options);
        }
export type GetSpheresQueryHookResult = ReturnType<typeof useGetSpheresQuery>;
export type GetSpheresLazyQueryHookResult = ReturnType<typeof useGetSpheresLazyQuery>;
export type GetSpheresSuspenseQueryHookResult = ReturnType<typeof useGetSpheresSuspenseQuery>;
export type GetSpheresQueryResult = Apollo.QueryResult<GetSpheresQuery, GetSpheresQueryVariables>;
export const GetOrbitHierarchyDocument = gql`
    query getOrbitHierarchy($params: OrbitHierarchyQueryParams!) {
  getOrbitHierarchy(params: $params)
}
    `;

/**
 * __useGetOrbitHierarchyQuery__
 *
 * To run a query within a React component, call `useGetOrbitHierarchyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrbitHierarchyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrbitHierarchyQuery({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetOrbitHierarchyQuery(baseOptions: Apollo.QueryHookOptions<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables> & ({ variables: GetOrbitHierarchyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>(GetOrbitHierarchyDocument, options);
      }
export function useGetOrbitHierarchyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>(GetOrbitHierarchyDocument, options);
        }
export function useGetOrbitHierarchySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>(GetOrbitHierarchyDocument, options);
        }
export type GetOrbitHierarchyQueryHookResult = ReturnType<typeof useGetOrbitHierarchyQuery>;
export type GetOrbitHierarchyLazyQueryHookResult = ReturnType<typeof useGetOrbitHierarchyLazyQuery>;
export type GetOrbitHierarchySuspenseQueryHookResult = ReturnType<typeof useGetOrbitHierarchySuspenseQuery>;
export type GetOrbitHierarchyQueryResult = Apollo.QueryResult<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>;
export const GetSphereDocument = gql`
    query getSphere($id: ID!) {
  sphere(id: $id) {
    id
    eH
    name
    metadata {
      description
      image
    }
  }
}
    `;

/**
 * __useGetSphereQuery__
 *
 * To run a query within a React component, call `useGetSphereQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSphereQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSphereQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetSphereQuery(baseOptions: Apollo.QueryHookOptions<GetSphereQuery, GetSphereQueryVariables> & ({ variables: GetSphereQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSphereQuery, GetSphereQueryVariables>(GetSphereDocument, options);
      }
export function useGetSphereLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSphereQuery, GetSphereQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSphereQuery, GetSphereQueryVariables>(GetSphereDocument, options);
        }
export function useGetSphereSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSphereQuery, GetSphereQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSphereQuery, GetSphereQueryVariables>(GetSphereDocument, options);
        }
export type GetSphereQueryHookResult = ReturnType<typeof useGetSphereQuery>;
export type GetSphereLazyQueryHookResult = ReturnType<typeof useGetSphereLazyQuery>;
export type GetSphereSuspenseQueryHookResult = ReturnType<typeof useGetSphereSuspenseQuery>;
export type GetSphereQueryResult = Apollo.QueryResult<GetSphereQuery, GetSphereQueryVariables>;
export const UpdateOrbitDocument = gql`
    mutation updateOrbit($orbitFields: OrbitUpdateParams!) {
  updateOrbit(orbit: $orbitFields) {
    id
    eH
    name
    parentHash
    sphereHash
    scale
    frequency
    metadata {
      description
      timeframe {
        startTime
        endTime
      }
    }
  }
}
    `;
export type UpdateOrbitMutationFn = Apollo.MutationFunction<UpdateOrbitMutation, UpdateOrbitMutationVariables>;

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
export function useUpdateOrbitMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOrbitMutation, UpdateOrbitMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOrbitMutation, UpdateOrbitMutationVariables>(UpdateOrbitDocument, options);
      }
export type UpdateOrbitMutationHookResult = ReturnType<typeof useUpdateOrbitMutation>;
export type UpdateOrbitMutationResult = Apollo.MutationResult<UpdateOrbitMutation>;
export type UpdateOrbitMutationOptions = Apollo.BaseMutationOptions<UpdateOrbitMutation, UpdateOrbitMutationVariables>;
export const GetOrbitDocument = gql`
    query getOrbit($id: ID!) {
  orbit(id: $id) {
    id
    eH
    name
    sphereHash
    frequency
    scale
    parentHash
    metadata {
      description
      timeframe {
        startTime
        endTime
      }
    }
  }
}
    `;

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
export function useGetOrbitQuery(baseOptions: Apollo.QueryHookOptions<GetOrbitQuery, GetOrbitQueryVariables> & ({ variables: GetOrbitQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrbitQuery, GetOrbitQueryVariables>(GetOrbitDocument, options);
      }
export function useGetOrbitLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrbitQuery, GetOrbitQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrbitQuery, GetOrbitQueryVariables>(GetOrbitDocument, options);
        }
export function useGetOrbitSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrbitQuery, GetOrbitQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrbitQuery, GetOrbitQueryVariables>(GetOrbitDocument, options);
        }
export type GetOrbitQueryHookResult = ReturnType<typeof useGetOrbitQuery>;
export type GetOrbitLazyQueryHookResult = ReturnType<typeof useGetOrbitLazyQuery>;
export type GetOrbitSuspenseQueryHookResult = ReturnType<typeof useGetOrbitSuspenseQuery>;
export type GetOrbitQueryResult = Apollo.QueryResult<GetOrbitQuery, GetOrbitQueryVariables>;
export const UpdateWinRecordDocument = gql`
    mutation updateWinRecord($winRecord: WinRecordUpdateParams!) {
  updateWinRecord(winRecord: $winRecord) {
    id
    eH
    orbitId
    winData {
      date
      value {
        ... on SingleWin {
          single
        }
        ... on MultipleWins {
          multiple
        }
      }
    }
  }
}
    `;
export type UpdateWinRecordMutationFn = Apollo.MutationFunction<UpdateWinRecordMutation, UpdateWinRecordMutationVariables>;

/**
 * __useUpdateWinRecordMutation__
 *
 * To run a mutation, you first call `useUpdateWinRecordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWinRecordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWinRecordMutation, { data, loading, error }] = useUpdateWinRecordMutation({
 *   variables: {
 *      winRecord: // value for 'winRecord'
 *   },
 * });
 */
export function useUpdateWinRecordMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWinRecordMutation, UpdateWinRecordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWinRecordMutation, UpdateWinRecordMutationVariables>(UpdateWinRecordDocument, options);
      }
export type UpdateWinRecordMutationHookResult = ReturnType<typeof useUpdateWinRecordMutation>;
export type UpdateWinRecordMutationResult = Apollo.MutationResult<UpdateWinRecordMutation>;
export type UpdateWinRecordMutationOptions = Apollo.BaseMutationOptions<UpdateWinRecordMutation, UpdateWinRecordMutationVariables>;
export const DeleteSphereDocument = gql`
    mutation deleteSphere($id: ID!) {
  deleteSphere(sphereHash: $id)
}
    `;
export type DeleteSphereMutationFn = Apollo.MutationFunction<DeleteSphereMutation, DeleteSphereMutationVariables>;

/**
 * __useDeleteSphereMutation__
 *
 * To run a mutation, you first call `useDeleteSphereMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSphereMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSphereMutation, { data, loading, error }] = useDeleteSphereMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSphereMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSphereMutation, DeleteSphereMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSphereMutation, DeleteSphereMutationVariables>(DeleteSphereDocument, options);
      }
export type DeleteSphereMutationHookResult = ReturnType<typeof useDeleteSphereMutation>;
export type DeleteSphereMutationResult = Apollo.MutationResult<DeleteSphereMutation>;
export type DeleteSphereMutationOptions = Apollo.BaseMutationOptions<DeleteSphereMutation, DeleteSphereMutationVariables>;