import { aOrbitConnection } from "./generated/mocks";

import CREATE_ORBIT from "../mutations/orbit/createOrbit.graphql";
import GET_ORBITS from "../queries/orbit/getOrbits.graphql";
import { Frequency, Scale } from "./generated";

import GET_ORBITS_BY_SPHERE from "../queries/orbit/getOrbitsBySphere.graphql";

export const ORBITS_MOCKS = [
  {
    request: {
      query: GET_ORBITS_BY_SPHERE,
      variables: { sphereEntryHashB64: "SGVhbHRoMQ==" }, // Base64 for "Health and Fitness" sphere id
    },
    result: {
      data: {
        orbits: aOrbitConnection({
          edges: [
            {
              node: {
                id: "R28gZm9yIGEgd2Fsay==", // Base64 for "Go for a walk"
                name: "Go for a walk",
                metadata: {
                  description: "A daily walk to improve cardiovascular health.",
                  frequency: Frequency.DAY,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
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
                  frequency: Frequency.WEEK,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
              },
              cursor: "",
            },
            {
              node: {
                id: "TWFrZSBhIGhlYWx0aHkgbWVhbA==", // Base64 for "Make a healthy meal"
                name: "Make a healthy meal",
                metadata: {
                  description: "Preparing nutritious meals to fuel the body for optimal health.",
                  frequency: Frequency.DAY,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
              },
              cursor: "",
            },
            {
              node: {
                id: "UHJhY3RpY2UgeW9nYQ==", // Base64 for "Practice yoga"
                name: "Practice yoga",
                metadata: {
                  description: "Engage in yoga to enhance flexibility, strength, and mental clarity.",
                  frequency: Frequency.WEEK,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
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
      query: GET_ORBITS_BY_SPHERE,
      variables: { sphereEntryHashB64: "TWVudGFsV2VsbGJlaW5nMg==" }, // Base64 for "Mental Wellbeing" sphere id
    },
    result: {
      data: {
        orbits: aOrbitConnection({
          edges: [
            {
              node: {
                id: "R28gZm9yIGEgd2Fsay==", // Base64 for "Go for a walk"
                name: "Go for a walk",
                metadata: {
                  description: "A daily walk to improve cardiovascular health.",
                  frequency: Frequency.DAY,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "TWVudGFsV2VsbGJlaW5nMg==", // Corresponding to "Health and Fitness" sphere id
              },
              cursor: "",
            },
            {
              node: {
                id: "QXR0ZW5kIGEgc29jaWFsIGdhdGhlcmluZw==", // Base64 for "Attend a social gathering"
                name: "Attend a social gathering",
                metadata: {
                  description: "Join friends or family for a social event to strengthen bonds.",
                  frequency: Frequency.WEEK,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "U29jaWFsQ29ubmVjdGlvbjQ=", // Corresponding to "Social Connection" sphere id
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
      query: GET_ORBITS_BY_SPHERE,
      variables: { sphereEntryHashB64: "UGVyc29uYWxEZXZlbG9wbWVudDM=" }, // Base64 for "Personal Development" sphere id
    },
    result: {
      data: {
        orbits: aOrbitConnection({
          edges: [
            {
              node: {
                id: "TGVhcm4gYSBuZXcgbGFuZ3VhZ2U=", // Base64 for "Learn a new language"
                name: "Learn a new language",
                metadata: {
                  description: "Dedicate time to mastering a new language for personal growth.",
                  frequency: Frequency.DAY,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "UGVyc29uYWxEZXZlbG9wbWVudDM=", // Corresponding to "Personal Development" sphere id
              },
              cursor: "",
            },
            {
              node: {
                id: "QXR0ZW5kIGEgcHJvZmVzc2lvbmFsIHdvcmtzaG9w", // Base64 for "Attend a professional workshop"
                name: "Attend a professional workshop",
                metadata: {
                  description: "Participate in a workshop to gain new skills in your field.",
                  frequency: Frequency.MONTH,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "UGVyc29uYWxEZXZlbG9wbWVudDM=", // Corresponding to "Personal Development" sphere id
              },
              cursor: "",
            },
            // ... other orbits with the same sphereEntryHashB64 if any
          ],
        }),
      },
    },
  },
  {
    request: {
      query: GET_ORBITS_BY_SPHERE,
      variables: { sphereEntryHashB64: "U29jaWFsQ29ubmVjdGlvbjQ=" }, // Base64 for "Social Connection" sphere id
    },
    result: {
      data: {
        orbits: aOrbitConnection({
          edges: [
            {
              node: {
                id: "T3JnYW5pemUgYSBjb21tdW5pdHkgZXZlbnQ=", // Base64 for "Organize a community event"
                name: "Organize a community event",
                metadata: {
                  description: "Plan and host an event to bring the local community together.",
                  frequency: Frequency.MONTH,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "U29jaWFsQ29ubmVjdGlvbjQ=", // Corresponding to "Social Connection" sphere id
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
      query: GET_ORBITS_BY_SPHERE,
      variables: { sphereEntryHashB64: "V29ya0FuZENhcmVlcjU=" }, // Base64 for "Work and Career" sphere id
    },
    result: {
      data: {
        orbits: aOrbitConnection({
          edges: [
            {
              node: {
                id: "R2V0IGEgcHJvbW90aW9u", // Base64 for "Get a promotion"
                name: "Get a promotion",
                metadata: {
                  description: "Work towards achieving a higher position within the company.",
                  frequency: Frequency.MONTH,
                  scale: Scale.ASTRO,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "V29ya0FuZENhcmVlcjU=", // Corresponding to "Work and Career" sphere id
              },
              cursor: "",
            },
            {
              node: {
                id: "U3RhcnQgYSBidXNpbmVzcw==", // Base64 for "Start a business"
                name: "Start a business",
                metadata: {
                  description: "Initiate the foundation of a new entrepreneurial venture.",
                  frequency: Frequency.QUARTER,
                  scale: Scale.ASTRO,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "V29ya0FuZENhcmVlcjU=", // Corresponding to "Work and Career" sphere id
              },
              cursor: "",
            },
            // ... other orbits with the same sphereEntryHashB64 if any
          ],
        }),
      },
    },
  },
  {
    request: {
      query: GET_ORBITS,
      variables: {},
    },
    result: {
      data: {
        orbits: aOrbitConnection({
          edges: [
            {
              node: {
                id: "R28gZm9yIGEgd2Fsay==", // Base64 for "Go for a walk"
                name: "Go for a walk",
                metadata: {
                  description: "A daily walk to improve cardiovascular health.",
                  frequency: Frequency.DAY,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
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
                  frequency: Frequency.WEEK,
                  scale: Scale.ATOM,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "SGVhbHRoMQ==", // Corresponding to "Health and Fitness" sphere id
              },
              cursor: "",
            },
            {
              node: {
                id: "UmVhZCBhbiBpbnRlcmVzdGluZyBib29r", // Base64 for "Read an interesting book"
                name: "Read an interesting book",
                metadata: {
                  description:
                    "Reading to expand knowledge and relax the mind.",
                  frequency: Frequency.DAY,
                  scale: Scale.ASTRO,
                },
                timeframe: {
                  startTime: 1617235200, // Mocked Unix timestamp for example
                  endTime: 1617321600, // Mocked Unix timestamp for example
                },
                sphereEntryHashB64: "TWVudGFsV2VsbGJlaW5nMg==", // Corresponding to "Mental Wellbeing" sphere id
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
      query: CREATE_ORBIT,
      variables: {
        name: "Go for a walk",
        metadata: {
          description: "A daily walk to improve cardiovascular health.",
          frequency: Frequency.DAY,
          scale: Scale.ATOM,
        },
        timeframe: {
          startTime: 1617235200,
          endTime: 1617321600,
        },
      },
    },
    result: {
      data: {
        createOrbit: {
          actionHash: "bW9ja2VkQWN0aW9uSGFzaA==", // Base64 for "mockedActionHash"
          entryHash: "bW9ja2VkRW50cnlIYXNo", // Base64 for "mockedEntryHash"
        },
      },
    },
  },
];
