import { SPHERE_ID } from "./mockAppState";
import {
  GetSpheresDocument,
  CreateSphereDocument,
  DeleteSphereDocument,
} from "../../../ui/src/graphql/generated";
import {
  aSphere,
  aSphereConnection,
  aSphereEdge,
} from "../../../ui/src/graphql/generated/mocks";

export const SPHERES_MOCKS: any = [
  {
    request: {
      query: GetSpheresDocument,
      variables: {},
    },
    result: {
      data: {
        spheres: aSphereConnection({
          edges: [
            aSphereEdge({
              node: aSphere({
                id: SPHERE_ID,
                name: "Health and Fitness",
                metadata: {
                  image: "abc",
                  hashtag: "fitness exercise nutrition",
                  description:
                    "Focus on physical health, exercise, and nutrition.",
                },
              }),
            }),
            aSphereEdge({
              node: aSphere({
                id: "TWVudGFsV2VsbGJlaW5nMg==",
                name: "Mental Wellbeing",
                metadata: {
                  image: "abc",
                  hashtag: "wellbeing mindfulness meditation",
                  description:
                    "Improve your mental health through mindfulness and meditation.",
                },
              }),
            }),
            aSphereEdge({
              node: aSphere({
                id: "UGVyc29uYWxEZXZlbG9wbWVudDM=",
                name: "Personal Development",
                metadata: {
                  image: "abc",
                  hashtag: "learning growth self-improvement",
                  description:
                    "Pursue personal growth and continuous learning.",
                },
              }),
            }),
            aSphereEdge({
              node: aSphere({
                id: "U29jaWFsQ29ubmVjdGlvbjQ=",
                name: "Social Connection",
                metadata: {
                  image: "abc",
                  hashtag: "relationships networking community",
                  description: "Build and maintain meaningful relationships.",
                },
              }),
            }),
            aSphereEdge({
              node: aSphere({
                id: "V29ya0FuZENhcmVlcjU=",
                name: "Work and Career",
                metadata: {
                  image: "abc",
                  hashtag: "career success work-life-balance",
                  description:
                    "Advance your career while maintaining work-life balance.",
                },
              }),
            }),
          ],
        }),
      },
    },
  },
  {
    request: {
      query: CreateSphereDocument,
      variables: {
        variables: {
          name: "ABC",
          hashtag: "ABC",
          description: "ABC",
          image: "ABC",
        },
      },
    },
    result: {
      data: {
        createSphere: {
          payload: {
            actionHash: "SGVhbHRoMQ==e",
            entryHash: "SGVhbHRoMQ==",
          },
        },
      },
    },
  },
  {
    result: {
      data: {},
    },
  },
];
