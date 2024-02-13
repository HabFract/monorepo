import {
  GetOrbitHierarchyDocument,
} from "../../../app/src/graphql/generated/index";
import { SPHERE_ID } from "./spheres";


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
        getOrbitHierarchy: `{"result": {"content":"uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu","name":"Be the best","children":[{"content":"R28gZm9yIGEgd2Fsay==1","name":"Child Node 1","children":[]},
        {"content":"R28gZm9yIGEgd2Fsay==2","name":"Child Node 2","children":[]}] }}`,
        // getOrbitHierarchy: `{"result": {"content":"L1R20-","name":"Be the best","children":[{"content":"L2R13-","name":"Be in peak physical condition","children":[{"content":"L3R12-","name":"Have a good exercise routine","children":[{"content":"L4R5-","name":"go for a short walk at least once a day","children":[]},{"content":"L6R11-","name":"Do some weight training","children":[{"content":"L7R8-","name":"3 sets of weights, til failure","children":[]},{"content":"L9R10-","name":"Do 3 sets of calisthenic exercises","children":[]}]}]}]},{"content":"L14R19-","name":"Establish productive work habits","children":[{"content":"L15R16-","name":"Do one 50 minute pomodoro ","children":[]},{"content":"L17R18-","name":"Read more books on computing","children":[]}]}]}}`,
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
        getOrbitHierarchy: "{\"result\":{\"level_trees\":[{\"content\":\"uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu\",\"name\":\"Be the best\",\"children\":[{\"content\":\"R28gZm9yIGEgd2Fsay==1\",\"name\":\"Child Node 1\",\"children\":[]}, {\"content\":\"R28gZm9yIGEgd2Fsay==2\",\"name\":\"Child Node 2\",\"children\":[]}] }]}}"
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
        getOrbitHierarchy: "{\"result\":{\"level_trees\":[{\"content\":\"uhCEkx2SQRKUrAZv7oMVcNvaaF5-jn2Tsewap6zXNlM_1k7kkbU5h\",\"name\":\"uhCEkx2SQRKUrAZv7oMVcNvaaF5-jn2Tsewap6zXNlM_1k7kkbU5h\",\"children\":[]},{\"content\":\"uhCEkqfZsLqgYny0reZuRIEW-KSeqoAYvdkSBx5oNJXU9Etka6CYc\",\"name\":\"uhCEkqfZsLqgYny0reZuRIEW-KSeqoAYvdkSBx5oNJXU9Etka6CYc\",\"children\":[]}]}}",
      },
    },
  },
];
