import {
  GetOrbitHierarchyDocument,
} from "../../../app/src/graphql/generated/index";
import { SPHERE_ID } from "./spheres";

export const HIERARCHY_ROOT_THREE_CHILDREN = [
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
            {content: "R28gZm9yIGEgd2Fsay==3C",
            name: "Be the best",
            children: [
              {
                content: "R28gZm9yIGEgd2Fsay==3C1",
                name: "Child Node 1 of 3",
                children: [
                ]
              },
              {
                content: "R28gZm9yIGEgd2Fsay==3C2",
                name: "Child Node 2 of 3",
                children: []
              },
              {
                content: "R28gZm9yIGEgd2Fsay==3C3",
                name: "Child Node 3 of 3",
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
          [
            {
              content: "R28gZm9yIGEgd2Fsay==3C1",
              name: "Child Node 1 of 3",
              children: [
              ]
            },
            {
              content: "R28gZm9yIGEgd2Fsay==3C2",
              name: "Child Node 2 of 3",
              children: []
            },
            {
              content: "R28gZm9yIGEgd2Fsay==3C3",
              name: "Child Node 3 of 3",
              children: []
            }] 
      }}),
      },
    },
  },
];