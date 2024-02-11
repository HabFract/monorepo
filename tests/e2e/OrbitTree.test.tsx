import React from 'react';

import '@testing-library/jest-dom'
import { render, waitFor, screen } from '@testing-library/react';

import OrbitTree from '../../app/src/components/vis/OrbitTree';

import { HIERARCHY_MOCKS } from './mocks/hierarchy';
import { MockedProvider } from '@apollo/client/testing';
import { renderVis } from '../../app/src/components/vis/helpers';
import { useGetOrbitHierarchyQuery } from '../../app/src/graphql/generated';

const Tree = renderVis(OrbitTree);

test('renders a loading state, then an orbit tree vis with a node', async () => {
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      {(Tree)}
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('Loading!')).toBeInTheDocument();
  });

  await waitFor(() => {
    
    // screen.debug()
    expect(screen.getByTestId("test-node")).toBeInTheDocument();
    expect(screen.getByTestId("svg")).toBeInTheDocument();
  });
});