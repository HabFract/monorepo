import React from 'react';
import '@testing-library/jest-dom'
import { expect, describe, test, it } from '@jest/globals';
import { screen, render, waitFor } from '@testing-library/react';

import OrbitList from '../../ui/src/components/lists/ListOrbits';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';
import { setMockNodeDetailsCache } from '../setupTests';
import { mockedCacheEntries } from './mocks/cache';
import { WithCurrentSphereMockedAtom } from '../utils-frontend';

test('renders an orbit list', async () => {
  
  const { getByText } = render(
    <MockedProvider mocks={ORBITS_MOCKS} addTypename={false}>
      {WithCurrentSphereMockedAtom( <OrbitList sphereAh={"SGVhbHRoMQ==e"} />)}
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Orbits Breakdown')).toBeTruthy();
  });
});