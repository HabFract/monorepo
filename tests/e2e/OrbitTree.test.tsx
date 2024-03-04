import React from 'react';
import '@testing-library/jest-dom'
import { expect, describe, test, it } from '@jest/globals';
import { render, waitFor, screen } from '@testing-library/react';

import { renderVis } from '../../app/src/components/vis/helpers';

import OrbitTree from '../../app/src/components/vis/OrbitTree';

import { HIERARCHY_MOCKS } from './mocks/hierarchy-root-only';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';
import { TestProvider } from '../utils-frontend';
import { mockedCacheEntries } from './mocks/cache';
import { SPHERE_ID } from './mocks/spheres';
import { currentSphere } from '../../app/src/state/currentSphereHierarchyAtom';

const Tree = renderVis(OrbitTree);


test('renders a loading state, then an orbit tree vis with a node', async () => {
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

test('renders details about the orbit', async () => {
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      <TestProvider initialValues={[
        [currentSphere, { entryHash: SPHERE_ID, actionHash: SPHERE_ID }],
      ]}>
        {(Tree)}
      </TestProvider>
    </MockedProvider>
  );

  const orbitName = ORBITS_MOCKS[0].result.data.orbits!.edges[0].node.name;

  await waitFor(() => {
    expect(getByText(orbitName)).toBeTruthy();
  });
});