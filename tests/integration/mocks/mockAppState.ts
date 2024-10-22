// tests/integration/mocks/mockAppState.ts
import { AppState } from "../../../ui/src/state/types/store";
import { Frequency } from "../../../ui/src/state/types/orbit";
import { Scale } from "../../../ui/src/graphql/generated";

// This is a placeholder base64 representation of a small JPG image
const placeholderImageBase64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";

export const SPHERE_ID = "uhCAkXt0f6QYXgVlp1E7IWvtd6tULHhLk5_5H6LWU8Xhk";
export const SPHERE_EH = "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX";

export const mockAppState: AppState = {
  spheres: {
    currentSphereHash: SPHERE_ID,
    byHash: {
      [SPHERE_ID]: {
        details: {
          entryHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
          name: "Health and Fitness",
          description: "Focus on physical health, exercise, and nutrition.",
          hashtag: "fitness",
          image: placeholderImageBase64,
        },
        hierarchyRootOrbitEntryHashes: [
          "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        ],
      },
    },
  },
  hierarchies: {
    byRootOrbitEntryHash: {},
  },
  orbitNodes: {
    currentOrbitHash: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
    byHash: {
      uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj: {
        id: "uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        eH: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
      },
      uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc: {
        id: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        eH: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        parentEh: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
      },
      uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc: {
        id: "uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
        eH: "uhCEkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        parentEh: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
      },
      uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc: {
        id: "uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        eH: "uhCEkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        parentEh: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
      },
      uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc: {
        id: "uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        eH: "uhCEkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        parentEh: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
      },
    },
  },
  wins: {
    // Only include win data for leaf nodes as all other nodes will be calculated dynamically in the client
    uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc: {
      "2023-W18": true,
      "2023-W19": false,
    },
    uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc: {
      "2023-05-01": [true, false],
      "2023-05-02": [false, false],
      "2023-05-03": [true, true],
    },
    uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc: {
      "2023-05": true,
      "2023-06": false,
    },
  },
  ui: {
    listSortFilter: {
      sortCriteria: "name",
      sortOrder: "lowestToGreatest",
    },
    currentDay: "2024-09-03",
  },
};

export const mockAppStateSphereNoOrbits: AppState = {
  spheres: {
    currentSphereHash: SPHERE_ID,
    byHash: {
      [SPHERE_ID]: {
        details: {
          entryHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
          name: "Health and Fitness",
          description: "Focus on physical health, exercise, and nutrition.",
          hashtag: "fitness",
          image: placeholderImageBase64,
        },
        hierarchyRootOrbitEntryHashes: [], // No root orbit entry hashes
      },
    },
  },
  hierarchies: {
    byRootOrbitEntryHash: {
      // This could be empty or contain a placeholder for a sphere with no nodes
      // If keeping a placeholder, ensure it reflects a state with no children/nodes
    },
  },
  orbitNodes: {
    currentOrbitHash: "", // Or `null`, depending on how your application expects to handle this
    byHash: {
      // Empty, reflecting no nodes
    },
  },
  wins: {
    // Adjust according to the logic for handling wins in the absence of nodes
    // Likely empty if wins are only associated with leaf nodes
  },
  ui: {
    listSortFilter: {
      sortCriteria: "name",
      sortOrder: "lowestToGreatest",
    },
    currentDay: "2024-09-03",
  },
};

export default mockAppState;
