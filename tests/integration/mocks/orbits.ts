import {
  anOrbit,
  anOrbitConnection,
  anOrbitEdge,
} from "../../../ui/src/graphql/generated/mocks";
import {
  GetOrbitsDocument,
  DeleteOrbitDocument,
  UpdateOrbitDocument,
} from "../../../ui/src/graphql/generated/index";

import { SPHERE_ID } from "./mockAppState";
import { mockedCacheEntries } from "./mockNodeCache";

const orbitData = mockedCacheEntries[0][1];

export const ORBITS_MOCKS: any = [
  {
    request: {
      query: GetOrbitsDocument,
      variables: { sphereEntryHashB64: SPHERE_ID },
    },
    result: {
      data: {
        orbits: anOrbitConnection({
          edges: Object.values(orbitData).map((orbit, index) =>
            anOrbitEdge({
              node: anOrbit({
                id: orbit.id,
                name: orbit.name,
                metadata: {
                  description: orbit.description,
                  timeframe: {
                    startTime: orbit.startTime,
                    endTime: orbit.endTime,
                  },
                },
                scale: orbit.scale,
                frequency: orbit.frequency,
                parentHash: orbit.parentEh || null,
                sphereHash: orbit.sphereHash,
                eH: orbit.eH,
              }),
              cursor: `cursor-${index}`,
            })
          ),
        }),
      },
    },
  },
  {
    request: {
      query: DeleteOrbitDocument,
      variables: {
        id: "uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
      },
    },
    result: {
      data: {
        deleteOrbit: {
          id: "uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
        },
      },
    },
  },
  {
    request: {
      query: UpdateOrbitDocument,
      variables: {
        input: {
          id: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
          name: "Updated Daily Exercise",
          metadata: {
            description:
              "Updated: Engage in daily physical activities for better health.",
            timeframe: {
              startTime: 1617235150,
              endTime: 1617321600,
            },
          },
          frequency: "DAILY_OR_MORE.DAILY",
          scale: "Sub",
        },
      },
    },
    result: {
      data: {
        updateOrbit: {
          orbit: anOrbit({
            id: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
            name: "Updated Daily Exercise",
            metadata: {
              description:
                "Updated: Engage in daily physical activities for better health.",
              timeframe: {
                startTime: 1617235150,
                endTime: 1617321600,
              },
            },
            frequency: "DAILY_OR_MORE.DAILY",
            scale: "Sub",
            parentHash: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
            sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
            eH: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
          }),
        },
      },
    },
  },
];
