import {
  GetOrbitHierarchyDocument,
} from "../../../ui/src/graphql/generated/index";
import { SPHERE_ID } from "./spheres";

// NOTE: In order for the Orbit Details to render on the visualisaiton, the content field of each node should match the id field in the cache.
// This is not always relevant, but useful to know.

export const HIERARCHY_ROOT_TWO_CHILDREN_MOCKS = [
  {
    request: {
      query: GetOrbitHierarchyDocument,
      variables: {
        params: {
          orbitEntryHashB64:"uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu"
        },
      },
    },
    result: {
      data: {
        getOrbitHierarchy: `{"result": {"content":"R28gZm9yIGEgd2Fsay==","name":"Be the best","children":[{"content":"R28gZm9yIGEgd2Fsay==1","name":"Child Node 1 of 2","children":[]},
        {"content":"R28gZm9yIGEgd2Fsay==2","name":"Child Node 2 of 2","children":[]}] }}`,
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
            orbitLevel: 0,
          },
        }
      },
    },
    result: {
      data: {
        getOrbitHierarchy: "{\"result\":{\"level_trees\":[{\"content\":\"R28gZm9yIGEgd2Fsay==\",\"name\":\"Be the best\",\"children\":[{\"content\":\"R28gZm9yIGEgd2Fsay==1\",\"name\":\"Child Node 1 of 2 traversal\",\"children\":[]},{\"content\":\"R28gZm9yIGEgd2Fsay==2\",\"name\":\"Child Node 2 of 2 traversal\",\"children\":[]}]  }]}}"
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
        }
      },
    },
    result: {
      data: {
        getOrbitHierarchy: "{\"result\":{\"level_trees\":[{\"content\":\"R28gZm9yIGEgd2Fsay==2C1\",\"name\":\"uhCEkx2SQRKUrAZv7oMVcNvaaF5-jn2Tsewap6zXNlM_1k7kkbU5h\",\"children\":[]},{\"content\":\"R28gZm9yIGEgd2Fsay==2C2\",\"name\":\"uhCEkqfZsLqgYny0reZuRIEW-KSeqoAYvdkSBx5oNJXU9Etka6CYc\",\"children\":[]}]  }}",
      },
    },
  },
];
