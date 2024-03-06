import {
  GetOrbitHierarchyDocument,
} from "../../../app/src/graphql/generated/index";
import { ORBITS_MOCKS } from "./orbits";
import { SPHERE_ID } from "./spheres";

const mockOrbits = ORBITS_MOCKS[0].result.data.orbits!.edges;

export const HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS = [
  // {
  //   request: {
  //     query: GetOrbitHierarchyDocument,
  //     variables: {
  //       params: {
  //         orbitEntryHashB64:"uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu"
  //       },
  //     },
  //   },
  //   result: {
  //     data: {
  //       getOrbitHierarchy: `{"result": {"content":"R28gZm9yIGEgd2Fsay==","name":"Be the best","children":[{"content":"R28gZm9yIGEgd2Fsay==1","name":"Child Node 1 of 2","children":[]},
  //       {"content":"R28gZm9yIGEgd2Fsay==2","name":"Child Node 2 of 2","children":[]}] }}`,
  //     },
  //   },
  // },
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
        getOrbitHierarchy: JSON.stringify({ result: { level_trees:
          [
            {content: "R28gZm9yIGEgd2Fsay==",
            name: "Be the best",
            children: [
              {
                content: "R28gZm9yIGEgd2Fsay==1",
                name: "Child Node 1 of 2",
                children: [
                  {
                    content: mockOrbits[2].node.id,
                    name: mockOrbits[2].node.name,
                    children: []
                  },
                  {
                    content: mockOrbits[3].node.id,
                    name: mockOrbits[3].node.name,
                    children: []
                  }
                ]
              },
              {
                content: "R28gZm9yIGEgd2Fsay==2",
                name: "Child Node 2 of 2",
                children: []
              }
            ]
            }
          ]
      }})
      }
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
        getOrbitHierarchy: JSON.stringify({ result: { level_trees:
          [{
            content: "R28gZm9yIGEgd2Fsay==1",
            name: "Child Node 1 of 2",
            children: [
              {
                content: mockOrbits[2].node.id,
                name: mockOrbits[2].node.name,
                children: []
              },
              {
                content: mockOrbits[3].node.id,
                name: mockOrbits[3].node.name,
                children: []
              }
            ]
          },
          {
            content: "R28gZm9yIGEgd2Fsay==2",
            name: "Child Node 2 of 2",
            children: []
          }] 
      }}),
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
            orbitLevel: 2,
          },
        }
      },
    },
    result: {
      data: {
        getOrbitHierarchy: JSON.stringify({ result: { level_trees:
          [
            {
              content: mockOrbits[2].node.id,
              name: mockOrbits[2].node.name,
              children: []
            },
            {
              content: mockOrbits[3].node.id,
              name: mockOrbits[3].node.name,
              children: []
            }
          ]
      }}),
      },
    },
  },
];