import { GetSpheresQueryResult } from './generated/index';
import { aSphere, aSphereConnection, aSphereEdge } from './generated/mocks';

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
      spheres: aSphereConnection({edges: [
        aSphereEdge({node: aSphere({id: 'SGVhbHRoMQ==', name:'Health and Fitness', metadata: {hashtag: 'fitness exercise nutrition', description: 'Focus on physical health, exercise, and nutrition.'}})}),
        aSphereEdge({node: aSphere({id: 'TWVudGFsV2VsbGJlaW5nMg==', name:'Mental Wellbeing', metadata: {hashtag: 'wellbeing mindfulness meditation', description: 'Improve your mental health through mindfulness and meditation.'}})}),
        aSphereEdge({node: aSphere({id: 'UGVyc29uYWxEZXZlbG9wbWVudDM=', name:'Personal Development', metadata: {hashtag: 'learning growth self-improvement', description: 'Pursue personal growth and continuous learning.'}})}),
        aSphereEdge({node: aSphere({id: 'U29jaWFsQ29ubmVjdGlvbjQ=', name:'Social Connection', metadata: {hashtag: 'relationships networking community', description: 'Build and maintain meaningful relationships.'}})}),
        aSphereEdge({node: aSphere({id: 'V29ya0FuZENhcmVlcjU=', name:'Work and Career', metadata: {hashtag: 'career success work-life-balance', description: 'Advance your career while maintaining work-life balance.'}})})]
      })
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