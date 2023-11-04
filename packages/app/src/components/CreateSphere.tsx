import React, { useState } from 'react';
import { useAddSphereMutation } from '../graphql/mocks/generated';

function CreateSphere() {
  const [name, setName] = useState('');
  const [createSphere, { data }] = useAddSphereMutation()

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log('{ variables: { name } } :>> ', { variables: { name } });
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
