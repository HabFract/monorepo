import { GetSpheresQueryResult } from './generated/index';
import { aOrbitConnection, aSphere, aSphereConnection, aSphereEdge } from './generated/mocks';

// import GET_SPHERE from './queries/sphere/getSphere.graphql';
import CREATE_ORBIT from '../mutations/orbit/createOrbit.graphql';
import GET_ORBITS from '../queries/orbit/getOrbits.graphql';

export const SPHERES_MOCKS = [{
  request: {
    query: GET_ORBITS,
    variables: {},
  },
  result: {
    data: {
      
      orbits: aOrbitConnection({edges: [
        // ... Add your mock orbit data here
      ]})
    },
  },
},
{
  request: {
    query: CREATE_ORBIT,
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