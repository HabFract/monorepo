/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  description: Scalars['String']['input'];
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
  description: Scalars['String']['output'];
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
  description: Scalars['String']['input'];
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

export type AddSphereMutationVariables = Exact<{
  variables: SphereCreateUpdateParams;
}>;


export type AddSphereMutation = { __typename?: 'Mutation', createSphere: { __typename?: 'SphereCreateResponse', payload: { __typename?: 'ResponsePayload', actionHash: string, entryHash: string } } };

export type GetOrbitQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOrbitQuery = { __typename?: 'Query', orbit: { __typename?: 'Orbit', name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description: string, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } };

export type GetOrbitsQueryVariables = Exact<{
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitsQuery = { __typename?: 'Query', orbits: { __typename?: 'OrbitConnection', edges: Array<{ __typename?: 'OrbitEdge', node: { __typename?: 'Orbit', id: string, name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description: string, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } }> } };

export type GetOrbitsBySphereQueryVariables = Exact<{
  sphereEntryHashB64?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrbitsBySphereQuery = { __typename?: 'Query', orbits: { __typename?: 'OrbitConnection', edges: Array<{ __typename?: 'OrbitEdge', node: { __typename?: 'Orbit', id: string, name: string, sphereEntryHashB64: string, metadata?: { __typename?: 'OrbitMetaData', description: string, frequency: Frequency, scale: Scale } | null, timeframe: { __typename?: 'TimeFrame', startTime: any, endTime: any } } }> } };

export type GetSphereQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSphereQuery = { __typename?: 'Query', sphere: { __typename?: 'Sphere', id: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, hashtag?: string | null } | null } };

export type GetSpheresQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSpheresQuery = { __typename?: 'Query', spheres: { __typename?: 'SphereConnection', edges: Array<{ __typename?: 'SphereEdge', node: { __typename?: 'Sphere', id: string, name: string, metadata?: { __typename?: 'SphereMetaData', description: string, hashtag?: string | null } | null } }> } };


export const CreateOrbitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createOrbit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variables"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrbitCreateUpdateParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrbit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orbit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variables"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionHash"}},{"kind":"Field","name":{"kind":"Name","value":"entryHash"}}]}}]}}]}}]} as unknown as DocumentNode<CreateOrbitMutation, CreateOrbitMutationVariables>;
export const UpdateOrbitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateOrbit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orbitFields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrbitCreateUpdateParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrbit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orbit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orbitFields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateOrbitMutation, UpdateOrbitMutationVariables>;
export const AddSphereDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addSphere"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variables"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SphereCreateUpdateParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSphere"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sphere"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variables"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionHash"}},{"kind":"Field","name":{"kind":"Name","value":"entryHash"}}]}}]}}]}}]} as unknown as DocumentNode<AddSphereMutation, AddSphereMutationVariables>;
export const GetOrbitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getOrbit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orbit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sphereEntryHashB64"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeframe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]}}]} as unknown as DocumentNode<GetOrbitQuery, GetOrbitQueryVariables>;
export const GetOrbitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getOrbits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sphereEntryHashB64"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orbits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sphereEntryHashB64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sphereEntryHashB64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sphereEntryHashB64"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeframe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetOrbitsQuery, GetOrbitsQueryVariables>;
export const GetOrbitsBySphereDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getOrbitsBySphere"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sphereEntryHashB64"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orbits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sphereEntryHashB64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sphereEntryHashB64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeframe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sphereEntryHashB64"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetOrbitsBySphereQuery, GetOrbitsBySphereQueryVariables>;
export const GetSphereDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getSphere"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sphere"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"hashtag"}}]}}]}}]}}]} as unknown as DocumentNode<GetSphereQuery, GetSphereQueryVariables>;
export const GetSpheresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getSpheres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spheres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"hashtag"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetSpheresQuery, GetSpheresQueryVariables>;