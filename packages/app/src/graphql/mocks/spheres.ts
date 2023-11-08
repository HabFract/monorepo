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
        aSphereEdge({node: aSphere({id: '1', name:'bob', metadata: {hashtag: 'hello', description: 'world'}})}),
        aSphereEdge({node: aSphere({id: '2', name:'bob', metadata: {hashtag: 'hello', description: 'world'}})}),
        aSphereEdge({node: aSphere({id: '3', name:'bob', metadata: {hashtag: 'hello', description: 'world'}})}),
        aSphereEdge({node: aSphere({id: '4', name:'bob', metadata: {hashtag: 'hello', description: 'world'}})}),
        aSphereEdge({node: aSphere({id: '5', name:'bob', metadata: {hashtag: 'hello', description: 'world'}})})]
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