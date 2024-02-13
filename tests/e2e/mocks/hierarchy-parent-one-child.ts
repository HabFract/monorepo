import { GetOrbitHierarchyDocument } from "../../../app/src/graphql/generated/index";

export const HIERARCHY_PARENT_ONE_CHILD_MOCKS = [
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          orbitEntryHashB64: "parent-one-child"
        },
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": {"content":"parent","name":"Parent Node","children":[{"content":"child1","name":"Child Node 1","children":[]}]}}`,
      },
    },
  },
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          levelQuery: {
            sphereHashB64: 'parent-one-child',
            orbitLevel: 0,
          },
        }
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"content":"parent","name":"Parent Node","children":[{"content":"child1","name":"Child Node 1","children":[]}]}`,
      },
    },
  },
];
