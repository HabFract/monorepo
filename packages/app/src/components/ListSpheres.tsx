import React from 'react';
import { useQuery } from '@apollo/client';
import GET_SPHERES from '../graphql/queries/sphere/getSpheres.graphql';

function ListSpheres() {
  const { loading, error, data } = useQuery(GET_SPHERES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  console.log('data.spheres :>> ', data.spheres);
  return (
    <div>
      <h2>List Spheres</h2>
      {data.spheres.edges.map(({ node: { name } }) => (
        <p key={name}>{name}</p>
      ))}
    </div>
  );
}

export default ListSpheres;
