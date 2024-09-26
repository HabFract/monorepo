import React from 'react';
import { expect, test } from 'vitest'
import { render, waitFor } from '@testing-library/react';

import OrbitList from '../../ui/src/components/lists/ListOrbits';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';
import { renderWithJotai } from '../utils-frontend';

test.skip('renders an orbit list', async () => {
  const { getByText } = render(
    <MockedProvider mocks={ORBITS_MOCKS} addTypename={false}>
      {renderWithJotai( <OrbitList sphereAh={"SGVhbHRoMQ==e"} />)}
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Orbit Breakdown')).toBeTruthy();
  });
});