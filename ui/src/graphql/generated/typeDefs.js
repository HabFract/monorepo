import {gql} from '@apollo/client';
export const typeDefs = gql`# General GQL Types
type Query {
  sphere(id: ID!): Sphere!
  spheres: SphereConnection!
  orbit(id: ID!): Orbit!
  orbits(sphereEntryHashB64: String): OrbitConnection!
  getOrbitHierarchy(params: OrbitHierarchyQueryParams!) : String! 
  getLowestSphereHierarchyLevel(sphereEntryHashB64: String!) : Int! 
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

# Holochain Specific Types
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

# ---- Profiles ----- #
# Profiles GQL Types

# Profiles Types
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

# Profile Input/Output
input UserProfileCreateUpdateParams {
  nickname: String!
  location: String
  isPublic: String
  avatar: String
}

# ---- Sphere ----- #
# Sphere GQL Types
type SphereConnection {
  edges: [SphereEdge!]!
  pageInfo: PageInfo!
}

type SphereEdge {
  cursor: String!
  node: Sphere!
}

# Sphere Types
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

# Sphere Input/Outputs
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

# ---- Orbit ----- #
# Orbit GQL Types
type OrbitConnection {
  edges: [OrbitEdge!]!
  pageInfo: PageInfo!
}

type OrbitEdge {
  cursor: String!
  node: Orbit!
}

# Orbit Types
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

# Frequency Enum
enum Frequency {
  Day
  Week
  Month
  Quarter
}

# Scale Enum
enum Scale {
  Astro
  Sub
  Atom
}

type OrbitMetaData {
  description: String
  timeframe: TimeFrame!
}

# Orbit Input/Outputs
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
}`;