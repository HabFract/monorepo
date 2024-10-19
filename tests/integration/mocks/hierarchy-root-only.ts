import {
  GetLowestSphereHierarchyLevelDocument,
  GetOrbitHierarchyDocument,
} from "../../../ui/src/graphql/generated/index";
import { SPHERE_EH, SPHERE_ID } from "./mockAppState";

// NOTE: In order for the Orbit Details to render on the visualisaiton, the content field of each node should match the id field in the mocked cache.
// This is not always relevant, but useful to know.
export const HIERARCHY_MOCKS = [
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          levelQuery: {
            sphereHashB64: SPHERE_EH, // Ensure this matches the SPHERE_EH from your mockAppState
            orbitLevel: 0,
          },
        },
      },
    },
    result: {
      data: {
        getOrbitHierarchy: JSON.stringify({
          result: {
            level_trees: [
              {
                content: SPHERE_ID,
                name: "Health and Fitness", // Example name, adjust based on your mockAppState
                children: [],
              },
            ],
          },
        }),
      },
    },
  },
  {
    request: {
      query: GetLowestSphereHierarchyLevelDocument,
      variables: {
        sphereEntryHashB64: SPHERE_EH,
      },
    },
    result: {
      data: { getLowestSphereHierarchyLevel: 0 }, // Adjust the level based on your mockAppState or test needs
    },
  },
  // Add more mocks as needed for other queries or expected data
];
