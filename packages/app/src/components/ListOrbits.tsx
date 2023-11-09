import React from 'react';
import './list.css';
import { useQuery } from '@apollo/client';
import GET_ORBITS from '../graphql/queries/orbit/getOrbits.graphql';
import PageHeader from './PageHeader';
import ListSortFilter from './ListSortFilter';
import OrbitCard from '../../../design-system/cards/OrbitCard';
import { OrbitEdge } from '../graphql/mocks/generated';

function ListOrbits() {
  const { loading, error, data } = useQuery(GET_ORBITS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <div className='bg-dark-gray px-2 py-1'>
      <PageHeader title="List of Orbits" />
      <ListSortFilter />
      <div className="orbits-list">
        {data.orbits.edges.map(({ node } : OrbitEdge) => <OrbitCard key={node.id} orbit={node} />)}
      </div>
    </div>
  );
}

export default ListOrbits;