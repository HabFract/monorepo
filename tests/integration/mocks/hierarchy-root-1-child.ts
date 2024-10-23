import {
  GetLowestSphereHierarchyLevelDocument,
  GetOrbitHierarchyDocument,
} from "../../../ui/src/graphql/generated/index";
import { SPHERE_ID } from "./spheres";

// NOTE: In order for the Orbit Details to render on the visualisaiton, the content field of each node should match the id field in the cache.
// This is not always relevant, but useful to know.

export const HIERARCHY_ROOT_ONE_CHILD_MOCKS = [
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          orbitEntryHashB64:
            "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu",
        },
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": {"content":"R28gZm9yIGEgd2Fsay==OC","name":"Go for a walk","children":[{"content":"R28gZm9yIGEgd2Fsay==OC1","name":"Go for a step","children":[]}]}}`,
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
        },
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": { "level_trees": [{"content":"R28gZm9yIGEgd2Fsay==OC","name":"Go for a walk","children":[{"content":"R28gZm9yIGEgd2Fsay==OC1","name":"Go for a step","children":[]}]}]}}`,
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
            orbitLevel: 1,
          },
        },
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": { "level_trees": [{"content":"R28gZm9yIGEgd2Fsay==OC1","name":"Go for a step","children":[]}]}}`,
      },
    },
  },
  {
    request: {
      query: GetLowestSphereHierarchyLevelDocument,
      variables: {
        sphereEntryHashB64: SPHERE_ID,
      },
    },
    result: {
      data: { getLowestSphereHierarchyLevel: 0 },
    },
  },
] as any;
