import {
  GetOrbitHierarchyDocument,
} from "../../../app/src/graphql/generated/index";
import { SPHERE_ID } from "./spheres";

// NOTE: In order for the Orbit Details to render on the visualisaiton, the content field of each node should match the id field in the cache.
// This is not always relevant, but useful to know.

export const HIERARCHY_MOCKS = [
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          orbitEntryHashB64:"R28gZm9yIGEgd2Fsay=="
        },
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": {"content":"R28gZm9yIGEgd2Fsay==","name":"R28gZm9yIGEgd2Fsay==","children":[]}}`,
      },
    },
  },
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          levelQuery: {
            sphereHashB64: SPHERE_ID,
            orbitLevel: 0,
          },
        }
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": { "level_trees": [{"content":"R28gZm9yIGEgd2Fsay==","name":"R28gZm9yIGEgd2Fsay==","children":[]}]}}`,
      },
    },
  },
];
