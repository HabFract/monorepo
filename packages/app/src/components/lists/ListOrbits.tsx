import React from 'react';
import './common.css';

import { useQuery } from '@apollo/client';
import { OrbitEdge } from '../../graphql/mocks/generated';
import GET_ORBITS from '../../graphql/queries/orbit/getOrbits.graphql';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';

import OrbitCard from '../../../../design-system/cards/OrbitCard';

import { useQuery, gql } from '@apollo/client';

interface ListOrbitsProps {
  sphereId?: string; // Optional prop to filter orbits by sphere
}

const GET_ORBITS_BY_SPHERE = gql`
  query getOrbits($sphereEntryHashB64: String) {
    orbits(sphereEntryHashB64: $sphereEntryHashB64) {
      edges {
        node {
          id
          name
          metadata {
            description
            frequency
            scale
          }
          timeframe {
            startTime
            endTime
          }
          sphereEntryHashB64
        }
      }
    }
  }
`;

function ListOrbits({ sphereId }: ListOrbitsProps) {
  const { loading, error, data } = useQuery(GET_ORBITS_BY_SPHERE, {
    variables: { sphereEntryHashB64: sphereId },
    skip: !sphereId, // Skip the query if no sphereId is provided
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <div className='h-full bg-dark-gray p-2 flex flex-col gap-2'>
      <PageHeader title="List of Orbits" />
      <ListSortFilter />
      <div className="orbits-list">
        {data?.orbits.edges.map(({ node } : OrbitEdge) => <OrbitCard key={node.id} orbit={node} />)}
      </div>
    </div>
  );
}

export default ListOrbits;
