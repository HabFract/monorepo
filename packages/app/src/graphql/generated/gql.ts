/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "mutation createOrbit($variables: OrbitCreateUpdateParams!) {\n  createOrbit(orbit: $variables) {\n    payload {\n      actionHash\n      entryHash\n    }\n  }\n}": types.CreateOrbitDocument,
    "mutation updateOrbit($orbitFields: OrbitCreateUpdateParams!) {\n  updateOrbit(orbit: $orbitFields) {\n    id\n  }\n}": types.UpdateOrbitDocument,
    "mutation createSphere($variables: SphereCreateUpdateParams!) {\n  createSphere(sphere: $variables) {\n    payload {\n      actionHash\n      entryHash\n    }\n  }\n}": types.CreateSphereDocument,
    "mutation updateSphere($sphereFields: SphereCreateUpdateParams!) {\n  updateSphere(sphere: $sphereFields) {\n    id\n  }\n}": types.UpdateSphereDocument,
    "query getOrbit($id: ID!) {\n  orbit(id: $id) {\n    name\n    sphereEntryHashB64\n    metadata {\n      description\n      frequency\n      scale\n    }\n    timeframe {\n      startTime\n      endTime\n    }\n  }\n}": types.GetOrbitDocument,
    "query getOrbits($sphereEntryHashB64: String) {\n  orbits(sphereEntryHashB64: $sphereEntryHashB64) {\n    edges {\n      node {\n        id\n        name\n        sphereEntryHashB64\n        metadata {\n          description\n          frequency\n          scale\n        }\n        timeframe {\n          startTime\n          endTime\n        }\n      }\n    }\n  }\n}": types.GetOrbitsDocument,
    "query getOrbitsBySphere($sphereEntryHashB64: String) {\n  orbits(sphereEntryHashB64: $sphereEntryHashB64) {\n    edges {\n      node {\n        id\n        name\n        metadata {\n          description\n          frequency\n          scale\n        }\n        timeframe {\n          startTime\n          endTime\n        }\n        sphereEntryHashB64\n      }\n    }\n  }\n}": types.GetOrbitsBySphereDocument,
    "query getSphere($id: ID!) {\n  sphere(id: $id) {\n    id\n    name\n    metadata {\n      description\n      hashtag\n    }\n  }\n}": types.GetSphereDocument,
    "query getSpheres {\n  spheres {\n    edges {\n      node {\n        id\n        name\n        metadata {\n          description\n          hashtag\n        }\n      }\n    }\n  }\n}": types.GetSpheresDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createOrbit($variables: OrbitCreateUpdateParams!) {\n  createOrbit(orbit: $variables) {\n    payload {\n      actionHash\n      entryHash\n    }\n  }\n}"): (typeof documents)["mutation createOrbit($variables: OrbitCreateUpdateParams!) {\n  createOrbit(orbit: $variables) {\n    payload {\n      actionHash\n      entryHash\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation updateOrbit($orbitFields: OrbitCreateUpdateParams!) {\n  updateOrbit(orbit: $orbitFields) {\n    id\n  }\n}"): (typeof documents)["mutation updateOrbit($orbitFields: OrbitCreateUpdateParams!) {\n  updateOrbit(orbit: $orbitFields) {\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createSphere($variables: SphereCreateUpdateParams!) {\n  createSphere(sphere: $variables) {\n    payload {\n      actionHash\n      entryHash\n    }\n  }\n}"): (typeof documents)["mutation createSphere($variables: SphereCreateUpdateParams!) {\n  createSphere(sphere: $variables) {\n    payload {\n      actionHash\n      entryHash\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation updateSphere($sphereFields: SphereCreateUpdateParams!) {\n  updateSphere(sphere: $sphereFields) {\n    id\n  }\n}"): (typeof documents)["mutation updateSphere($sphereFields: SphereCreateUpdateParams!) {\n  updateSphere(sphere: $sphereFields) {\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query getOrbit($id: ID!) {\n  orbit(id: $id) {\n    name\n    sphereEntryHashB64\n    metadata {\n      description\n      frequency\n      scale\n    }\n    timeframe {\n      startTime\n      endTime\n    }\n  }\n}"): (typeof documents)["query getOrbit($id: ID!) {\n  orbit(id: $id) {\n    name\n    sphereEntryHashB64\n    metadata {\n      description\n      frequency\n      scale\n    }\n    timeframe {\n      startTime\n      endTime\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query getOrbits($sphereEntryHashB64: String) {\n  orbits(sphereEntryHashB64: $sphereEntryHashB64) {\n    edges {\n      node {\n        id\n        name\n        sphereEntryHashB64\n        metadata {\n          description\n          frequency\n          scale\n        }\n        timeframe {\n          startTime\n          endTime\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query getOrbits($sphereEntryHashB64: String) {\n  orbits(sphereEntryHashB64: $sphereEntryHashB64) {\n    edges {\n      node {\n        id\n        name\n        sphereEntryHashB64\n        metadata {\n          description\n          frequency\n          scale\n        }\n        timeframe {\n          startTime\n          endTime\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query getOrbitsBySphere($sphereEntryHashB64: String) {\n  orbits(sphereEntryHashB64: $sphereEntryHashB64) {\n    edges {\n      node {\n        id\n        name\n        metadata {\n          description\n          frequency\n          scale\n        }\n        timeframe {\n          startTime\n          endTime\n        }\n        sphereEntryHashB64\n      }\n    }\n  }\n}"): (typeof documents)["query getOrbitsBySphere($sphereEntryHashB64: String) {\n  orbits(sphereEntryHashB64: $sphereEntryHashB64) {\n    edges {\n      node {\n        id\n        name\n        metadata {\n          description\n          frequency\n          scale\n        }\n        timeframe {\n          startTime\n          endTime\n        }\n        sphereEntryHashB64\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query getSphere($id: ID!) {\n  sphere(id: $id) {\n    id\n    name\n    metadata {\n      description\n      hashtag\n    }\n  }\n}"): (typeof documents)["query getSphere($id: ID!) {\n  sphere(id: $id) {\n    id\n    name\n    metadata {\n      description\n      hashtag\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query getSpheres {\n  spheres {\n    edges {\n      node {\n        id\n        name\n        metadata {\n          description\n          hashtag\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query getSpheres {\n  spheres {\n    edges {\n      node {\n        id\n        name\n        metadata {\n          description\n          hashtag\n        }\n      }\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;