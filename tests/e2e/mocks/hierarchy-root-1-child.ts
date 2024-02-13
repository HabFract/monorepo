import { GetOrbitHierarchyDocument } from "../../../app/src/graphql/generated/index";
import { SPHERE_ID } from "./spheres";

export const HIERARCHY_ROOT_ONE_CHILD_MOCKS = [
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          orbitEntryHashB64: SPHERE_ID
        },
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": {"content":"uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu","name":"Parent Node","children":[{"content":"R28gZm9yIGEgd2Fsay==1","name":"Child Node 1","children":[]}]}}`,
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
        getOrbitHierarchy: `{"result": { "level_trees": [{"content":"uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu","name":"Parent Node","children":[{"content":"R28gZm9yIGEgd2Fsay==1","name":"Child Node 1","children":[]}]}]}}`,
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
        }
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": { "level_trees": [{"content":"R28gZm9yIGEgd2Fsay==1","name":"Child Node 1","children":[]}]}}`,
      },
    },
  },
];
