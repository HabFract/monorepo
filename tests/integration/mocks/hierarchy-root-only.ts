import {
  GetLowestSphereHierarchyLevelDocument,
  GetOrbitHierarchyDocument,
  GetWinRecordForOrbitForMonthDocument,
} from "../../../ui/src/graphql/generated/index";
import { SPHERE_EH } from "./mockAppState";

// NOTE: In order for the Orbit Details to render on the visualisaiton, the content field of each node should match the id field in the mocked cache.
// This is not always relevant, but useful to know.
export const HIERARCHY_MOCKS = [
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          levelQuery: {
            sphereHashB64: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
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
                content: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
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
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          levelQuery: {
            sphereHashB64: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
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
                content: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
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
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          levelQuery: {
            sphereHashB64: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
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
                content: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
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
  {
    request: {
      query: GetWinRecordForOrbitForMonthDocument,
      variables: {
        params: {
          orbitEh: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
          yearDotMonth: "2024.10",
        },
      },
    },
    result: {
      data: {
        getWinRecordForOrbitForMonth: {
          id: "uhCAkWR15d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
          eH: "uhCEkWR15d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
          winData: [
            {
              date: "01/10/2024",
              value: {
                single: true,
                __typename: "SingleWin",
              },
              __typename: "WinDateEntry",
            },
          ],
        },
      },
    },
  },
  // Add more mocks as needed for other queries or expected data
] as any;
