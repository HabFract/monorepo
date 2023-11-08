import { GetSpheresQueryResult } from './generated/index';
import { aSphere, aSphereConnection } from './generated/mocks';

// import GET_SPHERE from './queries/sphere/getSphere.graphql';
import CREATE_SPHERE from '../mutations/sphere/createSphere.graphql';
import GET_SPHERES from '../queries/sphere/getSpheres.graphql';

export const SPHERES_MOCKS = [{
  request: {
    query: GET_SPHERES,
    variables: {},
  },
  result: {
    data: {
      spheres: aSphereConnection()
    },
  },
},
{
  request: {
    query: CREATE_SPHERE,
    variables: {variables:{
      name: "ABC",
      hashtag: "ABC",
      description: "ABC",
    }},
  },
  result: {
    data: {
      createSphere: {
        payload: {
          headerHash: "mockedHeaderHash",
          entryHash: "mockedEntryHash",
        },
      },
    },
  },
}
]