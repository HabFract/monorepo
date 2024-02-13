import { GetSpheresDocument, CreateSphereDocument, DeleteSphereDocument } from './../../../app/src/graphql/generated/index';
import { aSphere, aSphereConnection, aSphereEdge } from './../../../app/src/graphql/generated/mocks-types-fixed';

export const SPHERE_ID = 'SGVhbHRoMQ==e';

export const SPHERES_MOCKS = [{
  request: {
    query: GetSpheresDocument,
    variables: {},
  },
  result: {
    data: {
      spheres: aSphereConnection({edges: [
        aSphereEdge({node: aSphere({id: 'SGVhbHRoMQ==', name:'Health and Fitness', metadata: {image: 'abc', hashtag: 'fitness exercise nutrition', description: 'Focus on physical health, exercise, and nutrition.'}})}),
        aSphereEdge({node: aSphere({id: 'TWVudGFsV2VsbGJlaW5nMg==', name:'Mental Wellbeing', metadata: {image: 'abc', hashtag: 'wellbeing mindfulness meditation', description: 'Improve your mental health through mindfulness and meditation.'}})}),
        aSphereEdge({node: aSphere({id: 'UGVyc29uYWxEZXZlbG9wbWVudDM=', name:'Personal Development', metadata: {image: 'abc', hashtag: 'learning growth self-improvement', description: 'Pursue personal growth and continuous learning.'}})}),
        aSphereEdge({node: aSphere({id: 'U29jaWFsQ29ubmVjdGlvbjQ=', name:'Social Connection', metadata: {image: 'abc', hashtag: 'relationships networking community', description: 'Build and maintain meaningful relationships.'}})}),
        aSphereEdge({node: aSphere({id: 'V29ya0FuZENhcmVlcjU=', name:'Work and Career', metadata: {image: 'abc', hashtag: 'career success work-life-balance', description: 'Advance your career while maintaining work-life balance.'}})})]
      })
    },
  },
},
{
  request: {
    query: CreateSphereDocument,
    variables: {variables:{
      name: "ABC",
      hashtag: "ABC",
      description: "ABC",
      image: "ABC",
    }},
  },
  result: {
    data: {
      createSphere: {
        payload: {
          actionHash: "SGVhbHRoMQ==e",
          entryHash: "SGVhbHRoMQ==",
        },
      },
    },
  },
},
{
  request: {
    query: DeleteSphereDocument,
    variables: {
      id: "SGVhbHRoMQ==e"
    },
  },
  result: {
    data: {
    },
  },
}
]