import { gql } from "@apollo/client/core";
export const typeDefs = gql`
  schema {
    query: Query
    mutation: Mutation
  }
  type Query {
    sphere(id: ID!): Sphere!
    spheres: SphereConnection!
    orbit(id: ID!): Orbit!
    orbits(sphereEntryHashB64: String): OrbitConnection!
    getOrbitHierarchy(params: OrbitHierarchyQueryParams!): String!
    getLowestSphereHierarchyLevel(sphereEntryHashB64: String!): Int!
    me: AgentProfile!
  }
  type Mutation {
    createSphere(sphere: SphereCreateParams): CreateSphereResponsePayload!
    updateSphere(sphere: SphereUpdateParams): CreateSphereResponsePayload!
    deleteSphere(sphereHash: ID!): ID!
    createOrbit(orbit: OrbitCreateParams): CreateOrbitResponsePayload!
    updateOrbit(orbit: OrbitUpdateParams): CreateOrbitResponsePayload!
    deleteOrbit(orbitHash: ID!): ID!
    createProfile(profile: UserProfileCreateUpdateParams): AgentProfile!
    updateProfile(profile: UserProfileCreateUpdateParams): AgentProfile!
  }
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String!
    endCursor: String!
  }
  interface Node {
    id: ID!
    eH: String!
  }
  type CreateSphereResponsePayload {
    id: ID!
    actionHash: String!
    entryHash: String!
    eH: String!
    name: String!
    metadata: SphereMetaData
  }
  type CreateOrbitResponsePayload {
    id: ID!
    actionHash: String!
    entryHash: String!
    eH: String!
    name: String!
    sphereHash: String!
    parentHash: String
    childHash: String
    frequency: Frequency!
    scale: Scale!
    metadata: OrbitMetaData
  }
  type CreateResponsePayload {
    actionHash: String!
    entryHash: String!
  }
  type AgentProfile {
    agentPubKey: String!
    profile: Profile!
  }
  type Profile {
    nickname: String!
    fields: ProfileFields
  }
  type ProfileFields {
    location: String
    isPublic: String
    avatar: String
  }
  input UserProfileCreateUpdateParams {
    nickname: String!
    location: String
    isPublic: String
    avatar: String
  }
  type SphereConnection {
    edges: [SphereEdge!]!
    pageInfo: PageInfo!
  }
  type SphereEdge {
    cursor: String!
    node: Sphere!
  }
  type Sphere implements Node {
    id: ID!
    eH: String!
    name: String!
    metadata: SphereMetaData
  }
  type SphereMetaData {
    description: String!
    hashtag: String
    image: String
  }
  input SphereCreateParams {
    name: String!
    description: String
    hashtag: String
    image: String
  }
  input SphereUpdateParams {
    id: ID!
    name: String!
    description: String
    hashtag: String
    image: String
  }
  type OrbitConnection {
    edges: [OrbitEdge!]!
    pageInfo: PageInfo!
  }
  type OrbitEdge {
    cursor: String!
    node: Orbit!
  }
  type Orbit implements Node {
    id: ID!
    eH: String!
    name: String!
    sphereHash: String!
    parentHash: String
    childHash: String
    frequency: Frequency!
    scale: Scale!
    metadata: OrbitMetaData
  }
  type TimeFrame {
    startTime: Float!
    endTime: Float
  }
  enum Frequency {
    Day
    Week
    Month
    Quarter
  }
  enum Scale {
    Astro
    Sub
    Atom
  }
  type OrbitMetaData {
    description: String
    timeframe: TimeFrame!
  }
  input OrbitCreateParams {
    name: String!
    startTime: Float!
    endTime: Float
    description: String
    frequency: Frequency!
    scale: Scale!
    sphereHash: String!
    parentHash: String
    childHash: String
  }
  input OrbitUpdateParams {
    id: ID!
    name: String!
    startTime: Float!
    endTime: Float
    description: String
    frequency: Frequency!
    scale: Scale!
    sphereHash: String!
    parentHash: String
  }
  input OrbitHierarchyQueryParams {
    orbitEntryHashB64: String
    levelQuery: QueryParamsLevel
  }
  input QueryParamsLevel {
    sphereHashB64: String
    orbitLevel: Float!
  }
`;
