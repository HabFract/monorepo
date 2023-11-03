import { GetSpheresQueryResult } from './generated/index';
import { aSphere } from './generated/mocks';

// import GET_SPHERE from './queries/sphere/getSphere.graphql';
import CREATE_SPHERE from './mutations/sphere/createSphere.graphql';
import GET_SPHERES from './queries/sphere/getSpheres.graphql';

export const SPHERES_MOCKS = [{
  request: {
    query: GET_SPHERES,
    variables: {},
  },
  result: {
    data: {
      GetSpheresQueryResult: [aSphere()],
    },
  },
},
{
  request: {
    query: CREATE_SPHERE,
    variables: {},
  },
  result: {
    data: {
      sphere: aSphere(),
    },
  },
}
]