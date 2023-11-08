import React from 'react';
import { useQuery } from '@apollo/client';
import GET_ORBITS from '../graphql/queries/orbit/getOrbits.graphql';
import PageHeader from './PageHeader';
import ListSortFilter from './ListSortFilter';
import OrbitCard from './cards/OrbitCard';

function ListOrbits() {
  const { loading, error, data } = useQuery(GET_ORBITS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <div>
      <PageHeader title="List of Orbits" />
      <ListSortFilter />
      <div className="orbits-list">
        {data.orbits.edges.map(({ node }) => <OrbitCard key={node.id} orbit={node} />)}
      </div>
    </div>
  );
}

export default ListOrbits;