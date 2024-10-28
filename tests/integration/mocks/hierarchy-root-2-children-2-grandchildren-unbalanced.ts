import { GetOrbitHierarchyDocument } from "../../../ui/src/graphql/generated/index";
import { SPHERE_ID } from "./mockAppState";

export const HIERARCHY_ROOT_2CH_2GRCH_UNBALANCED = [
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          levelQuery: {
            sphereHashB64: SPHERE_ID,
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
                name: "Be the best",
                children: [
                  {
                    content: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
                    name: "Daily Exercise",
                    children: [
                      {
                        content:
                          "uhCEkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
                        name: "Weekly Gym Session",
                        children: [],
                      },
                      {
                        content:
                          "uhCEkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
                        name: "Daily Meditation",
                        children: [],
                      },
                    ],
                  },
                  {
                    content: "uhCEkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
                    name: "Monthly Health Check",
                    children: [],
                  },
                ],
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
            sphereHashB64: SPHERE_ID,
            orbitLevel: 1,
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
                content: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
                name: "Daily Exercise",
                children: [
                  {
                    content: "uhCEkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
                    name: "Weekly Gym Session",
                    children: [],
                  },
                  {
                    content: "uhCEkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
                    name: "Daily Meditation",
                    children: [],
                  },
                ],
              },
              {
                content: "uhCEkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
                name: "Monthly Health Check",
                children: [],
              },
            ],
          },
        }),
      },
    },
  },
] as any;
