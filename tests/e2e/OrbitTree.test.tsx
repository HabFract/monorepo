import React from 'react';
import '@testing-library/jest-dom'
import { expect, describe, test, it } from '@jest/globals';
import { render, waitFor, screen, act } from '@testing-library/react';

import { renderVis } from '../../app/src/components/vis/helpers';

import OrbitTree from '../../app/src/components/vis/OrbitTree';

import { HIERARCHY_MOCKS } from './mocks/hierarchy-root-only';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';

const Tree = renderVis(OrbitTree);


test.skip('renders a loading state, then an orbit tree vis with a node', async () => {
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      {(Tree)}
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('Loading!')).toBeTruthy();
  });

  await waitFor(() => {
    expect(screen.getByTestId("test-node")).toBeTruthy();
    expect(screen.getByTestId("svg")).toBeTruthy();
  });
});

test.skip('renders details about the orbit', async () => {
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      {(Tree)}
    </MockedProvider>
  );

  const orbitName = ORBITS_MOCKS[0].result.data.orbits!.edges[0].node.name;

  await act(async () => {
    await new Promise((r) => setTimeout(r, 2000));
  })
  
  await waitFor(() => {
    expect(getByText(orbitName)).toBeTruthy();
  });
});