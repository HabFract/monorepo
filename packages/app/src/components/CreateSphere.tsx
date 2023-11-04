import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_SPHERE } from '../graphql/mutations/sphere';

function CreateSphere() {
  const [name, setName] = useState('');
  const [createSphere, { data }] = useMutation(CREATE_SPHERE);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createSphere({ variables: { name } });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Create Sphere</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button type="submit">Create Sphere</button>
      </form>
    </div>
  );
}

export default CreateSphere;
