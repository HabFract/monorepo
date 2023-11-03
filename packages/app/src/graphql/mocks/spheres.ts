import { aSphere } from './generated/mocks';

import gql from 'graphql-tag';
import { loader } from 'graphql.macro';

const GET_SPHERE = loader('../queries/sphere/getSpheres.graphql');
const GET_SPHERES = loader('../queries/sphere/getSpheres.graphql');

export const SPHERES_MOCKS = [{
  request: {
    query: GET_SPHERES,
    variables: {},
  },
  result: {
    data: {
      sphere: [aSphere()],
    },
  },
},
{
  request: {
    query: GET_SPHERE,
    variables: {},
  },
  result: {
    data: {
      habit: aSphere(),
    },
  },
}
]