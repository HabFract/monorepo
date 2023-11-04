import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_SPHERES } from '../graphql/queries/sphere';

function ListSpheres() {
  const { loading, error, data } = useQuery(GET_SPHERES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <h2>List Spheres</h2>
      {data.spheres.map(({ name }) => (
        <p key={name}>{name}</p>
      ))}
    </div>
  );
}

export default ListSpheres;
