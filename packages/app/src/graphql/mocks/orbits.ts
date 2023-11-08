import { aOrbitConnection } from './generated/mocks';

import CREATE_ORBIT from '../mutations/orbit/createOrbit.graphql';
import GET_ORBITS from '../queries/orbit/getOrbits.graphql';

export const ORBITS_MOCKS = [{
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
              frequency: Frequency.DAY,
              scale: Scale.MICRO, // Assuming 'ATOMIC' was a typo and should be 'MICRO'
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
              description: 'Strength training to build muscle and increase metabolism.',
              frequency: Frequency.WEEK, // Assuming 'MONTH' should be replaced with 'WEEK' as 'MONTH' is not part of the enum
              scale: Scale.MICRO,
            },
          },
        },
        {
          node: {
            id: 'UmVhZCBhbiBpbnRlcmVzdGluZyBib29r', // Base64 for "Read an interesting book"
            name: 'Read an interesting book',
            description: 'Reading to expand knowledge and relax the mind.',
            metadata: {
              description: 'Reading to expand knowledge and relax the mind.',
              frequency: Frequency.DAY, // Assuming 'YEAR' should be replaced with 'DAY' as 'YEAR' is not part of the enum
              scale: Scale.MACRO,
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
