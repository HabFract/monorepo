import React from 'react';
import './common.css';

import { useQuery } from '@apollo/client';
import { OrbitEdge } from '../../graphql/mocks/generated';
import GET_ORBITS from '../../graphql/queries/orbit/getOrbits.graphql';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';

import OrbitCard from '../../../../design-system/cards/OrbitCard';

function ListOrbits() {
  const { loading, error, data } = useQuery(GET_ORBITS);

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