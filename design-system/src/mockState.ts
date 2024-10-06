// tests/integration/mocks/mockAppState.ts

import { Frequency } from "@ui/src/state/types";
import { Scale } from "./generated-types";

// This is a placeholder base64 representation of a small JPG image
const placeholderImageBase64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";

export const mockAppState = {
  spheres: {
    currentSphereHash: "uhCAkXt0f6QYXgVlp1E7IWvtd6tULHhLk5_5H6LWU8Xhk",
    byHash: {
      uhCAkXt0f6QYXgVlp1E7IWvtd6tULHhLk5_5H6LWU8Xhk: {
        details: {
          entryHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
          name: "Health and Fitness",
          description: "Focus on physical health, exercise, and nutrition.",
          hashtag: "fitness",
          image: placeholderImageBase64,
        },
        hierarchyRootOrbitEntryHashes: ["uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj"],
      },
    },
  },
  hierarchies: {
    byRootOrbitEntryHash: {
      uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj: {
        rootNode: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        json: JSON.stringify({
          content: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
          name: "Be the best",
          children: [
            {
              content: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
              name: "Daily Exercise",
              children: [
                { content: "uhCEkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc", name: "Weekly Gym Session" },
                { content: "uhCEkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc", name: "Daily Meditation" },
              ],
            },
            { content: "uhCEkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc", name: "Monthly Health Check" },
          ],
        }),
        bounds: { minBreadth: 0, maxBreadth: 2, minDepth: 0, maxDepth: 2 },
        indices: { x: 0, y: 0 },
        currentNode: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        nodeHashes: [
          "uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
          "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
          "uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
          "uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
          "uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc"
        ],
      },
    },
  },
  orbitNodes: {
    currentOrbitHash: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
    byHash: {
      uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj: {
        id: "uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        eH: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        name: "Be the best",
        scale: Scale.Astro,
        frequency: Frequency.DAILY_OR_MORE.DAILY,
        startTime: 1617235200,
        endTime: undefined,
        description: "Strive to be the best version of yourself every day.",
        path: "M0,0C0,897.21,0,897.21,0,1794.421",
      },
      uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc: {
        id: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        eH: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        name: "Daily Exercise",
        scale: Scale.Sub,
        frequency: Frequency.DAILY_OR_MORE.DAILY,
        startTime: 1617235200,
        endTime: undefined,
        description: "Engage in daily physical activity to maintain fitness.",
        parentEh: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        path: "M0,0C0,776.75,-1020,776.75,-1020,1553.5",
      },
      uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc: {
        id: "uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
        eH: "uhCEkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        name: "Weekly Gym Session",
        scale: Scale.Atom,
        frequency: Frequency.LESS_THAN_DAILY.WEEKLY,
        startTime: 1617235200,
        endTime: undefined,
        description: "Attend a structured gym session once a week.",
        parentEh: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        path: "M0,0C0,776.75,-2040,776.75,-2040,1553.5",
      },
      uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc: {
        id: "uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        eH: "uhCEkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        name: "Daily Meditation",
        scale: Scale.Atom,
        frequency: Frequency.DAILY_OR_MORE.TWO,
        startTime: 1617235200,
        endTime: undefined,
        description: "Practice mindfulness and meditation daily. 10 minutes each session.",
        parentEh: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        path: "M0,0C0,776.75,0,776.75,0,1553.5",
      },
      uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc: {
        id: "uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        eH: "uhCEkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        name: "Monthly Health Check",
        scale: Scale.Atom,
        frequency: Frequency.LESS_THAN_DAILY.MONTHLY,
        startTime: 1617235200,
        endTime: undefined,
        description: "Conduct a comprehensive health check-up monthly.",
        parentEh: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        path: "M0,0C0,776.75,1020,776.75,1020,1553.5",
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

export default mockAppState;
