/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
  Day = 'DAY',
  Hour = 'HOUR',
  Week = 'WEEK'
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
  id: Scalars['ID']['output'];
};

export type Orbit = Node & {
  __typename?: 'Orbit';
  id: Scalars['ID']['output'];
  metadata?: Maybe<OrbitMetaData>;
  name: Scalars['String']['output'];
  sphereEntryHashB64: Scalars['String']['output'];
  timeframe: TimeFrame;
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
  endTime: Scalars['DateTime']['input'];
  frequency: Frequency;
  name: Scalars['String']['input'];
  scale: Scale;
  sphereEntryHashB64: Scalars['String']['input'];
  startTime: Scalars['DateTime']['input'];
};

export type OrbitEdge = {
  __typename?: 'OrbitEdge';
  cursor: Scalars['String']['output'];
  node: Orbit;
};

export type OrbitMetaData = {
  __typename?: 'OrbitMetaData';
  description?: Maybe<Scalars['String']['output']>;
  frequency: Frequency;
  scale: Scale;
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
  me: AgentProfile;
  orbit: Orbit;
  orbits: OrbitConnection;
  sphere: Sphere;
  spheres: SphereConnection;
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
  Astro = 'ASTRO',
  Atom = 'ATOM',
  Sub = 'SUB'
}

export type Sphere = Node & {
  __typename?: 'Sphere';
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
  endTime: Scalars['DateTime']['output'];
  startTime: Scalars['DateTime']['output'];
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


export type GetOrbitQuery = { __typename?: 'Query', orbit: { __typename?: 'Orbit', name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } };

export type GetOrbitsQueryVariables = Exact<{
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitsQuery = { __typename?: 'Query', orbits: { __typename?: 'OrbitConnection', edges: Array<{ __typename?: 'OrbitEdge', node: { __typename?: 'Orbit', id: string, name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } }> } };

export type GetOrbitsBySphereQueryVariables = Exact<{
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitsBySphereQuery = { __typename?: 'Query', orbits: { __typename?: 'OrbitConnection', edges: Array<{ __typename?: 'OrbitEdge', node: { __typename?: 'Orbit', id: string, name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } }> } };

export type GetSphereQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSphereQuery = { __typename?: 'Query', sphere: { __typename?: 'Sphere', id: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, hashtag?: string | null } | null } };

export type GetSpheresQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSpheresQuery = { __typename?: 'Query', spheres: { __typename?: 'SphereConnection', edges: Array<{ __typename?: 'SphereEdge', node: { __typename?: 'Sphere', id: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, hashtag?: string | null } | null } }> } };


export const CreateOrbitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createOrbit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variables"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrbitCreateUpdateParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrbit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orbit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variables"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionHash"}},{"kind":"Field","name":{"kind":"Name","value":"entryHash"}}]}}]}}]}}]} as unknown as DocumentNode<CreateOrbitMutation, CreateOrbitMutationVariables>;
export const UpdateOrbitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateOrbit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orbitFields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrbitCreateUpdateParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrbit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orbit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orbitFields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateOrbitMutation, UpdateOrbitMutationVariables>;
export const CreateSphereDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createSphere"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variables"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SphereCreateUpdateParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSphere"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sphere"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variables"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionHash"}},{"kind":"Field","name":{"kind":"Name","value":"entryHash"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSphereMutation, CreateSphereMutationVariables>;
export const UpdateSphereDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateSphere"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sphereFields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SphereCreateUpdateParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSphere"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sphere"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sphereFields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateSphereMutation, UpdateSphereMutationVariables>;
export const GetOrbitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getOrbit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orbit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sphereEntryHashB64"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeframe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]}}]} as unknown as DocumentNode<GetOrbitQuery, GetOrbitQueryVariables>;
export const GetOrbitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getOrbits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sphereEntryHashB64"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orbits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sphereEntryHashB64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sphereEntryHashB64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sphereEntryHashB64"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeframe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetOrbitsQuery, GetOrbitsQueryVariables>;
export const GetOrbitsBySphereDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getOrbitsBySphere"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sphereEntryHashB64"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orbits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sphereEntryHashB64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sphereEntryHashB64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeframe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sphereEntryHashB64"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>;
export const GetSphereDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getSphere"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sphere"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"hashtag"}}]}}]}}]}}]} as unknown as DocumentNode<GetSphereQuery, GetSphereQueryVariables>;
export const GetSpheresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getSpheres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spheres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"hashtag"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetSpheresQuery, GetSpheresQueryVariables>;
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
  Day = 'DAY',
  Hour = 'HOUR',
  Week = 'WEEK'
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
  id: Scalars['ID']['output'];
};

export type Orbit = Node & {
  __typename?: 'Orbit';
  id: Scalars['ID']['output'];
  metadata?: Maybe<OrbitMetaData>;
  name: Scalars['String']['output'];
  sphereEntryHashB64: Scalars['String']['output'];
  timeframe: TimeFrame;
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
  endTime: Scalars['DateTime']['input'];
  frequency: Frequency;
  name: Scalars['String']['input'];
  scale: Scale;
  sphereEntryHashB64: Scalars['String']['input'];
  startTime: Scalars['DateTime']['input'];
};

export type OrbitEdge = {
  __typename?: 'OrbitEdge';
  cursor: Scalars['String']['output'];
  node: Orbit;
};

export type OrbitMetaData = {
  __typename?: 'OrbitMetaData';
  description?: Maybe<Scalars['String']['output']>;
  frequency: Frequency;
  scale: Scale;
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
  me: AgentProfile;
  orbit: Orbit;
  orbits: OrbitConnection;
  sphere: Sphere;
  spheres: SphereConnection;
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
  Astro = 'ASTRO',
  Atom = 'ATOM',
  Sub = 'SUB'
}

export type Sphere = Node & {
  __typename?: 'Sphere';
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
  endTime: Scalars['DateTime']['output'];
  startTime: Scalars['DateTime']['output'];
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


export type GetOrbitQuery = { __typename?: 'Query', orbit: { __typename?: 'Orbit', name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } };

export type GetOrbitsQueryVariables = Exact<{
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitsQuery = { __typename?: 'Query', orbits: { __typename?: 'OrbitConnection', edges: Array<{ __typename?: 'OrbitEdge', node: { __typename?: 'Orbit', id: string, name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } }> } };

export type GetOrbitsBySphereQueryVariables = Exact<{
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitsBySphereQuery = { __typename?: 'Query', orbits: { __typename?: 'OrbitConnection', edges: Array<{ __typename?: 'OrbitEdge', node: { __typename?: 'Orbit', id: string, name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description?: string | null, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } }> } };

export type GetSphereQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSphereQuery = { __typename?: 'Query', sphere: { __typename?: 'Sphere', id: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, hashtag?: string | null } | null } };

export type GetSpheresQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSpheresQuery = { __typename?: 'Query', spheres: { __typename?: 'SphereConnection', edges: Array<{ __typename?: 'SphereEdge', node: { __typename?: 'Sphere', id: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, hashtag?: string | null } | null } }> } };


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
    name
    sphereEntryHashB64
    metadata {
      description
      frequency
      scale
    }
    timeframe {
      startTime
      endTime
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
export const GetOrbitsDocument = gql`
    query getOrbits($sphereEntryHashB64: String) {
  orbits(sphereEntryHashB64: $sphereEntryHashB64) {
    edges {
      node {
        id
        name
        sphereEntryHashB64
        metadata {
          description
          frequency
          scale
        }
        timeframe {
          startTime
          endTime
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
export const GetOrbitsBySphereDocument = gql`
    query getOrbitsBySphere($sphereEntryHashB64: String) {
  orbits(sphereEntryHashB64: $sphereEntryHashB64) {
    edges {
      node {
        id
        name
        metadata {
          description
          frequency
          scale
        }
        timeframe {
          startTime
          endTime
        }
        sphereEntryHashB64
      }
    }
  }
}
    `;

/**
 * __useGetOrbitsBySphereQuery__
 *
 * To run a query within a React component, call `useGetOrbitsBySphereQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrbitsBySphereQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrbitsBySphereQuery({
 *   variables: {
 *      sphereEntryHashB64: // value for 'sphereEntryHashB64'
 *   },
 * });
 */
export function useGetOrbitsBySphereQuery(baseOptions?: Apollo.QueryHookOptions<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>(GetOrbitsBySphereDocument, options);
      }
export function useGetOrbitsBySphereLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>(GetOrbitsBySphereDocument, options);
        }
export function useGetOrbitsBySphereSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>(GetOrbitsBySphereDocument, options);
        }
export type GetOrbitsBySphereQueryHookResult = ReturnType<typeof useGetOrbitsBySphereQuery>;
export type GetOrbitsBySphereLazyQueryHookResult = ReturnType<typeof useGetOrbitsBySphereLazyQuery>;
export type GetOrbitsBySphereSuspenseQueryHookResult = ReturnType<typeof useGetOrbitsBySphereSuspenseQuery>;
export type GetOrbitsBySphereQueryResult = Apollo.QueryResult<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>;
export const GetSphereDocument = gql`
    query getSphere($id: ID!) {
  sphere(id: $id) {
    id
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