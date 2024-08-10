import { GetLowestSphereHierarchyLevelDocument } from './../../../ui/src/graphql/generated/index';

import { anOrbitConnection } from '../../../ui/src/graphql/generated/mocks-types-fixed'
import { GetOrbitsDocument, Frequency, Scale, DeleteOrbitDocument, GetSphereDocument } from '../../../ui/src/graphql/generated/index'

export const ORBITS_MOCKS = [
  {
    request: {
      query: GetOrbitsDocument,
      variables: { sphereEntryHashB64: "SGVhbHRoMQ==e" }, // Base64 for "Health and Fitness" sphere id
    },
    result: {
      data: {
        orbits: anOrbitConnection({
          edges: [
            {
              node: {
                id: "R28gZm9yIGEgd2Fsay==", // Base64 for "Go for a walk"
                name: "Go for a walk",
                metadata: {
                  description: "A daily walk to improve cardiovascular health.",
                  timeframe: {
                    startTime: 1617235200, // Mocked Unix timestamp for example
                    endTime: 1617321600, // Mocked Unix timestamp for example
                  },
                },
                scale: Scale.Atom,
                frequency: Frequency.Day,
                parentHash: null,
                sphereHash: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
                eH:"R28gZm9yIGEgd2Fsay==",
              },
              cursor: "",
            },
            {
              node: {
                id: "R28gZm9yIGEgd2Fsay==1",
                name: "Go for a step",
                metadata: {
                  description: "A daily stepwalk to improve cardiovascular health.",
                  timeframe: {
                    startTime: 161723520, // Mocked Unix timestamp for example
                    endTime: 161732160, // Mocked Unix timestamp for example
                  },
                },
                scale: Scale.Atom,
                frequency: Frequency.Day,
                parentHash: null,
                sphereHash: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
                eH:"R28gZm9yIGEgd2Fsay==",
              },
              cursor: "",
            },
            {
              node: {
                id: "TGlmdCB3ZWlnaHRz", // Base64 for "Lift weights"
                name: "Lift weights",
                metadata: {
                  description:
                    "Strength training to build muscle and increase metabolism.",
                  timeframe: {
                    startTime: 1617235200, // Mocked Unix timestamp for example
                    endTime: 1617321600, // Mocked Unix timestamp for example
                  },
                },
                frequency: Frequency.Week,
                scale: Scale.Atom,
                parentHash: null,
                sphereHash: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
                eH: 'TGlmdCB3ZWlnaHRz'
              },
              cursor: "",
            },
            {
              node: {
                id: "TWFrZSBhIGhlYWx0aHkgbWVhbA==", // Base64 for "Make a healthy meal"
                name: "Make a healthy meal",
                metadata: {
                  description: "Preparing nutritious meals to fuel the body for optimal health.",
                  timeframe: {
                    startTime: 1617235200, // Mocked Unix timestamp for example
                    endTime: 1617321600, // Mocked Unix timestamp for example
                  },
                },
                frequency: Frequency.Day,
                scale: Scale.Atom,
                parentHash: null,
                sphereHash: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
                eH: "TWFrZSBhIGhlYWx0aHkgbWVhbA==",
              },
              cursor: "",
            },
            {
              node: {
                id: "UHJhY3RpY2UgeW9nYQ==", // Base64 for "Practice yoga"
                name: "Practice yoga",
                metadata: {
                  description: "Engage in yoga to enhance flexibility, strength, and mental clarity.",
                  timeframe: {
                    startTime: 1617235200, // Mocked Unix timestamp for example
                    endTime: 1617321600, // Mocked Unix timestamp for example
                  },
                },
                frequency: Frequency.Week,
                scale: Scale.Atom,
                parentHash: null,
                sphereHash: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
                eH: "UHJhY3RpY2UgeW9nYQ=="
              },
              cursor: "",
            },
          ],
        }),
      },
    },
  },
  {
    request: {
      query: DeleteOrbitDocument,
      variables: {
        id: "R28gZm9yIGEgd2Fsay=="
      },
    },
    result: {
      data: {
      },
    },
  },
  {
    request: {
      query: GetSphereDocument,
      variables: {
        id: "SGVhbHRoMQ==e"
      },
    },
    result: {
      data: {
        sphere: {
          id: "SGVhbHRoMQ==e",
          eH: "SGVhbHRoMQ==e",          
          name: "ABC",
          hashtag: "ABC",
          metadata: {
            description: "ABC",
            image: "ABC",
          }
        }
      },
    },
  }
];