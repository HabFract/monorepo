import React from 'react';
import { describe, expect, test, it } from 'vitest'
import { render, waitFor } from '@testing-library/react';

import SphereList from '../../ui/src/components/lists/ListSpheres';
import { SPHERES_MOCKS } from './mocks/spheres';
import { MockedProvider } from '@apollo/client/testing';
import { WithCurrentSphereMockedAtom } from '../utils-frontend';

test('renders a sphere list', async () => {
  const { getByText } = render(
    <MockedProvider mocks={SPHERES_MOCKS} addTypename={false}>
      {WithCurrentSphereMockedAtom(<SphereList />)}
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Sphere Breakdown')).toBeTruthy();
  });
});