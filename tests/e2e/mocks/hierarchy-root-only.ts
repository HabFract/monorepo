import {
  GetSpheresDocument,
  CreateSphereDocument,
  DeleteSphereDocument,
  GetOrbitHierarchyDocument,
} from "../../../app/src/graphql/generated/index";
import {
  aSphere,
  aSphereConnection,
  aSphereEdge,
} from "../../../app/src/graphql/generated/mocks-types-fixed";
import { SPHERE_ID } from "./spheres";

// const getQueryParams = (customDepth?: number) : OrbitHierarchyQueryParams => queryType == 'whole'
// ? { orbitEntryHashB64: params.orbitEh }
// : { levelQuery: { sphereHashB64: params.currentSphereHash, orbitLevel: customDepth || 0 } };

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
