import React from 'react';
import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react';

import OrbitList from '../../app/src/components/lists/ListOrbits';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';

test('renders an orbit list', async () => {
  const { getByText } = render(
    <MockedProvider mocks={ORBITS_MOCKS} addTypename={false}>
      <OrbitList sphereHash={"SGVhbHRoMQ==e"} />
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Orbit List')).toBeInTheDocument();
  });
});