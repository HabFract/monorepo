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
        {
          node: {
            id: 'R28gZm9yIGEgd2Fsay==', // Base64 for "Go for a walk"
            name: 'Go for a walk',
            metadata: {
              description: 'A daily walk to improve cardiovascular health.',
              frequency: 'DAY',
              scale: 'ATOMIC',
              isAtomic: true,
            },
            timeframe: {
              startTime: 1617235200, // Mocked Unix timestamp for example
              endTime: 1617321600,   // Mocked Unix timestamp for example
            },
          },
        },
        {
          node: {
            id: 'TGlmdCB3ZWlnaHRz', // Base64 for "Lift weights"
            name: 'Lift weights',
            description: 'Strength training to build muscle and increase metabolism.',
            metadata: {
              frequency: 'MONTH',
              scale: 'MICRO',
            },
          },
        },
        {
          node: {
            id: 'UmVhZCBhbiBpbnRlcmVzdGluZyBib29r', // Base64 for "Read an interesting book"
            name: 'Read an interesting book',
            description: 'Reading to expand knowledge and relax the mind.',
            metadata: {
              frequency: 'YEAR',
              scale: 'MACRO',
            },
          },
        },
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
