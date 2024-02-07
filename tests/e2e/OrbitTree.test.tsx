import React from 'react';

import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react';

import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { withVisCanvas } from '../../app/src/components/vis/HOC/withVisCanvas';

import { HIERARCHY_MOCKS } from './mocks/hierarchy';
import { MockedProvider } from '@apollo/client/testing';

const Tree = withVisCanvas(OrbitTree);

test('renders an orbit tree', async () => {
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      {Tree}
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Spheres List')).toBeInTheDocument();
  });
});