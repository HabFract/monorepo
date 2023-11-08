import React from 'react';
import { useQuery } from '@apollo/client';
import GET_SPHERES from '../graphql/queries/sphere/getSpheres.graphql';
import PageHeader from './PageHeader';
import ListSortFilter from './ListSortFilter';

function ListSpheres() {
  const { loading, error, data } = useQuery(GET_SPHERES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <div>
      <PageHeader title="List of Spheres" />
      <ListSortFilter />
      <div className="spheres-list">
        {data.spheres.edges.map(({ node }) => (
          <p key={node.id}>{node.name}</p> // Adjusted to match the GraphQL schema assuming 'id' is part of the node
        ))}
      </div>
    </div>
  );
}

export default ListSpheres;
