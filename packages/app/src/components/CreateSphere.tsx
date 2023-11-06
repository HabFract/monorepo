import React, { useState } from 'react';
import { useAddSphereMutation } from '../graphql/mocks/generated';
import { Button, TextInput, Label } from 'flowbite-react';

function CreateSphere() {
  const [name, setName] = useState('');
  const [createSphere, { data }] = useAddSphereMutation()

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createSphere({ variables: { name } });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Create Sphere</h2>
      <form onSubmit={handleSubmit}>
        <Label>
          <span>Name:</span>
          <TextInput type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </Label>
        <Button type="submit" variant="primary" className="mt-4">Create Sphere</Button>
      </form>
    </div>
  );
}

export default CreateSphere;
