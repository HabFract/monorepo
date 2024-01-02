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
  DateTime: { input: any; output: any; }
};

export type AgentProfile = {
  __typename?: 'AgentProfile';
  agentPubKey: Scalars['String']['output'];
  profile: Profile;
};

export enum Frequency {
  Day = 'Day',
  Month = 'Month',
  Quarter = 'Quarter',
  Week = 'Week'
}

export type Mutation = {
  __typename?: 'Mutation';
  createOrbit: OrbitCreateResponse;
  createProfile: AgentProfile;
  createSphere: SphereCreateResponse;
  updateOrbit: Orbit;
  updateProfile: AgentProfile;
  updateSphere: Sphere;
};


export type MutationCreateOrbitArgs = {
  orbit?: InputMaybe<OrbitCreateUpdateParams>;
};


export type MutationCreateProfileArgs = {
  profile?: InputMaybe<UserProfileCreateUpdateParams>;
};


export type MutationCreateSphereArgs = {
  sphere?: InputMaybe<SphereCreateUpdateParams>;
};


export type MutationUpdateOrbitArgs = {
  orbit?: InputMaybe<OrbitCreateUpdateParams>;
};


export type MutationUpdateProfileArgs = {
  profile?: InputMaybe<UserProfileCreateUpdateParams>;
};


export type MutationUpdateSphereArgs = {
  sphere?: InputMaybe<SphereCreateUpdateParams>;
};

export type Node = {
  eH: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type Orbit = Node & {
  __typename?: 'Orbit';
  eH: Scalars['String']['output'];
  frequency: Frequency;
  id: Scalars['ID']['output'];
  metadata?: Maybe<OrbitMetaData>;
  name: Scalars['String']['output'];
  parentHash?: Maybe<Scalars['String']['output']>;
  scale: Scale;
  sphereHash: Scalars['String']['output'];
};

export type OrbitConnection = {
  __typename?: 'OrbitConnection';
  edges: Array<OrbitEdge>;
  pageInfo: PageInfo;
};

export type OrbitCreateResponse = {
  __typename?: 'OrbitCreateResponse';
  payload: ResponsePayload;
};

export type OrbitCreateUpdateParams = {
  description?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['Float']['input']>;
  frequency: Frequency;
  name: Scalars['String']['input'];
  parentHash?: InputMaybe<Scalars['String']['input']>;
  scale: Scale;
  sphereHash: Scalars['String']['input'];
  startTime: Scalars['Float']['input'];
};

export type OrbitEdge = {
  __typename?: 'OrbitEdge';
  cursor: Scalars['String']['output'];
  node: Orbit;
};

export type OrbitMetaData = {
  __typename?: 'OrbitMetaData';
  description?: Maybe<Scalars['String']['output']>;
  timeframe: TimeFrame;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Scalars['String']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Scalars['String']['output'];
};

export type Profile = {
  __typename?: 'Profile';
  fields?: Maybe<ProfileFields>;
  nickname: Scalars['String']['output'];
};

export type ProfileFields = {
  __typename?: 'ProfileFields';
  avatar?: Maybe<Scalars['String']['output']>;
  isPublic?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  getOrbitHierarchy: Scalars['String']['output'];
  me: AgentProfile;
  orbit: Orbit;
  orbits: OrbitConnection;
  sphere: Sphere;
  spheres: SphereConnection;
};


export type QueryGetOrbitHierarchyArgs = {
  orbitEntryHashB64?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrbitArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrbitsArgs = {
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySphereArgs = {
  id: Scalars['ID']['input'];
};

export type ResponsePayload = {
  __typename?: 'ResponsePayload';
  actionHash: Scalars['String']['output'];
  entryHash: Scalars['String']['output'];
};

export enum Scale {
  Astro = 'Astro',
  Atom = 'Atom',
  Sub = 'Sub'
}

export type Sphere = Node & {
  __typename?: 'Sphere';
  eH: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  metadata?: Maybe<SphereMetaData>;
  name: Scalars['String']['output'];
};

export type SphereConnection = {
  __typename?: 'SphereConnection';
  edges: Array<SphereEdge>;
  pageInfo: PageInfo;
};

export type SphereCreateResponse = {
  __typename?: 'SphereCreateResponse';
  payload: ResponsePayload;
};

export type SphereCreateUpdateParams = {
  description?: InputMaybe<Scalars['String']['input']>;
  hashtag?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type SphereEdge = {
  __typename?: 'SphereEdge';
  cursor: Scalars['String']['output'];
  node: Sphere;
};

export type SphereMetaData = {
  __typename?: 'SphereMetaData';
  description: Scalars['String']['output'];
  hashtag?: Maybe<Scalars['String']['output']>;
};

export type TimeFrame = {
  __typename?: 'TimeFrame';
  endTime?: Maybe<Scalars['Float']['output']>;
  startTime: Scalars['Float']['output'];
};

export type UserProfileCreateUpdateParams = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  nickname: Scalars['String']['input'];
};

export type CreateOrbitMutationVariables = Exact<{
  variables: OrbitCreateUpdateParams;
}>;


export type CreateOrbitMutation = { __typename?: 'Mutation', createOrbit: { __typename?: 'OrbitCreateResponse', payload: { __typename?: 'ResponsePayload', actionHash: string, entryHash: string } } };

export type UpdateOrbitMutationVariables = Exact<{
  orbitFields: OrbitCreateUpdateParams;
}>;


export type UpdateOrbitMutation = { __typename?: 'Mutation', updateOrbit: { __typename?: 'Orbit', id: string } };

export type CreateSphereMutationVariables = Exact<{
  variables: SphereCreateUpdateParams;
}>;


export type CreateSphereMutation = { __typename?: 'Mutation', createSphere: { __typename?: 'SphereCreateResponse', payload: { __typename?: 'ResponsePayload', actionHash: string, entryHash: string } } };

export type UpdateSphereMutationVariables = Exact<{
  sphereFields: SphereCreateUpdateParams;
}>;


export type UpdateSphereMutation = { __typename?: 'Mutation', updateSphere: { __typename?: 'Sphere', id: string } };

export type GetOrbitQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOrbitQuery = { __typename?: 'Query', orbit: { __typename?: 'Orbit', id: string, eH: string, name: string, sphereHash: string, frequency: Frequency, scale: Scale, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, timeframe: { __typename?: 'TimeFrame', startTime: number, endTime?: number | null } } | null } };

export type GetOrbitHierarchyQueryVariables = Exact<{
  orbitEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitHierarchyQuery = { __typename?: 'Query', getOrbitHierarchy: string };

export type GetOrbitsQueryVariables = Exact<{
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitsQuery = { __typename?: 'Query', orbits: { __typename?: 'OrbitConnection', edges: Array<{ __typename?: 'OrbitEdge', node: { __typename?: 'Orbit', id: string, eH: string, name: string, sphereHash: string, frequency: Frequency, scale: Scale, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, timeframe: { __typename?: 'TimeFrame', startTime: number, endTime?: number | null } } | null } }> } };

export type GetSphereQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSphereQuery = { __typename?: 'Query', sphere: { __typename?: 'Sphere', id: string, eH: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, hashtag?: string | null } | null } };

export type GetSpheresQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSpheresQuery = { __typename?: 'Query', spheres: { __typename?: 'SphereConnection', edges: Array<{ __typename?: 'SphereEdge', node: { __typename?: 'Sphere', id: string, eH: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, hashtag?: string | null } | null } }> } };


export const CreateOrbitDocument = gql`
    mutation createOrbit($variables: OrbitCreateUpdateParams!) {
  createOrbit(orbit: $variables) {
    payload {
      actionHash
      entryHash
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
export const UpdateOrbitDocument = gql`
    mutation updateOrbit($orbitFields: OrbitCreateUpdateParams!) {
  updateOrbit(orbit: $orbitFields) {
    id
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
export const CreateSphereDocument = gql`
    mutation createSphere($variables: SphereCreateUpdateParams!) {
  createSphere(sphere: $variables) {
    payload {
      actionHash
      entryHash
    }
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
export const UpdateSphereDocument = gql`
    mutation updateSphere($sphereFields: SphereCreateUpdateParams!) {
  updateSphere(sphere: $sphereFields) {
    id
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
 *      sphereFields: // value for 'sphereFields'
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
export const GetOrbitDocument = gql`
    query getOrbit($id: ID!) {
  orbit(id: $id) {
    id
    eH
    name
    sphereHash
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
export function useGetOrbitQuery(baseOptions: Apollo.QueryHookOptions<GetOrbitQuery, GetOrbitQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrbitQuery, GetOrbitQueryVariables>(GetOrbitDocument, options);
      }
export function useGetOrbitLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrbitQuery, GetOrbitQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrbitQuery, GetOrbitQueryVariables>(GetOrbitDocument, options);
        }
export function useGetOrbitSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetOrbitQuery, GetOrbitQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrbitQuery, GetOrbitQueryVariables>(GetOrbitDocument, options);
        }
export type GetOrbitQueryHookResult = ReturnType<typeof useGetOrbitQuery>;
export type GetOrbitLazyQueryHookResult = ReturnType<typeof useGetOrbitLazyQuery>;
export type GetOrbitSuspenseQueryHookResult = ReturnType<typeof useGetOrbitSuspenseQuery>;
export type GetOrbitQueryResult = Apollo.QueryResult<GetOrbitQuery, GetOrbitQueryVariables>;
export const GetOrbitHierarchyDocument = gql`
    query getOrbitHierarchy($orbitEntryHashB64: String) {
  getOrbitHierarchy(orbitEntryHashB64: $orbitEntryHashB64)
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
 *      orbitEntryHashB64: // value for 'orbitEntryHashB64'
 *   },
 * });
 */
export function useGetOrbitHierarchyQuery(baseOptions?: Apollo.QueryHookOptions<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>(GetOrbitHierarchyDocument, options);
      }
export function useGetOrbitHierarchyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>(GetOrbitHierarchyDocument, options);
        }
export function useGetOrbitHierarchySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>(GetOrbitHierarchyDocument, options);
        }
export type GetOrbitHierarchyQueryHookResult = ReturnType<typeof useGetOrbitHierarchyQuery>;
export type GetOrbitHierarchyLazyQueryHookResult = ReturnType<typeof useGetOrbitHierarchyLazyQuery>;
export type GetOrbitHierarchySuspenseQueryHookResult = ReturnType<typeof useGetOrbitHierarchySuspenseQuery>;
export type GetOrbitHierarchyQueryResult = Apollo.QueryResult<GetOrbitHierarchyQuery, GetOrbitHierarchyQueryVariables>;
export const GetOrbitsDocument = gql`
    query getOrbits($sphereEntryHashB64: String) {
  orbits(sphereEntryHashB64: $sphereEntryHashB64) {
    edges {
      node {
        id
        eH
        name
        sphereHash
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
export function useGetOrbitsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetOrbitsQuery, GetOrbitsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrbitsQuery, GetOrbitsQueryVariables>(GetOrbitsDocument, options);
        }
export type GetOrbitsQueryHookResult = ReturnType<typeof useGetOrbitsQuery>;
export type GetOrbitsLazyQueryHookResult = ReturnType<typeof useGetOrbitsLazyQuery>;
export type GetOrbitsSuspenseQueryHookResult = ReturnType<typeof useGetOrbitsSuspenseQuery>;
export type GetOrbitsQueryResult = Apollo.QueryResult<GetOrbitsQuery, GetOrbitsQueryVariables>;
export const GetSphereDocument = gql`
    query getSphere($id: ID!) {
  sphere(id: $id) {
    id
    eH
    name
    metadata {
      description
      hashtag
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
export function useGetSphereQuery(baseOptions: Apollo.QueryHookOptions<GetSphereQuery, GetSphereQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSphereQuery, GetSphereQueryVariables>(GetSphereDocument, options);
      }
export function useGetSphereLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSphereQuery, GetSphereQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSphereQuery, GetSphereQueryVariables>(GetSphereDocument, options);
        }
export function useGetSphereSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSphereQuery, GetSphereQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSphereQuery, GetSphereQueryVariables>(GetSphereDocument, options);
        }
export type GetSphereQueryHookResult = ReturnType<typeof useGetSphereQuery>;
export type GetSphereLazyQueryHookResult = ReturnType<typeof useGetSphereLazyQuery>;
export type GetSphereSuspenseQueryHookResult = ReturnType<typeof useGetSphereSuspenseQuery>;
export type GetSphereQueryResult = Apollo.QueryResult<GetSphereQuery, GetSphereQueryVariables>;
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
          hashtag
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
export function useGetSpheresSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSpheresQuery, GetSpheresQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSpheresQuery, GetSpheresQueryVariables>(GetSpheresDocument, options);
        }
export type GetSpheresQueryHookResult = ReturnType<typeof useGetSpheresQuery>;
export type GetSpheresLazyQueryHookResult = ReturnType<typeof useGetSpheresLazyQuery>;
export type GetSpheresSuspenseQueryHookResult = ReturnType<typeof useGetSpheresSuspenseQuery>;
export type GetSpheresQueryResult = Apollo.QueryResult<GetSpheresQuery, GetSpheresQueryVariables>;