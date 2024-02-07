import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react';

import SphereList from '../../app/src/components/lists/ListSpheres';
import { SPHERES_MOCKS } from './mocks/spheres';
import { MockedProvider } from '@apollo/client/testing';

test('renders a sphere list', async () => {
  const { getByText } = render(
    <MockedProvider mocks={SPHERES_MOCKS} addTypename={false}>
      <SphereList />
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Spheres List')).toBeInTheDocument();
  });
});