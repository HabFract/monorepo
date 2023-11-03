import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

export const SPHERES_MOCK = {
  request: {
    query: gql`
      query GetSpheres {
        spheres {
          edges {
            cursor
            node {
              id
              name
              metadata {
                description
                hashtag
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  result: {
    data: {
      spheres: {
        edges: [
          {
            cursor: 'cursor1',
            node: {
              id: '1',
              name: 'Sphere 1',
              metadata: {
                description: 'Description for Sphere 1',
                hashtag: '#sphere1'
              },
            },
          },
          // ...add more mock spheres as needed
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor1',
        },
      },
    },
  },
};
