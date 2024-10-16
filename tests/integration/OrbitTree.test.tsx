import React from 'react';
import { expect, test, it, afterEach, describe, beforeAll, vi } from 'vitest'
import { render, waitFor, screen, act, cleanup } from '@testing-library/react';
import { renderVis } from '../../ui/src/components/vis/helpers';
  
import OrbitTree from '../../ui/src/components/vis/OrbitTree-2';

import { HIERARCHY_MOCKS } from './mocks/hierarchy-root-only';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { renderWithJotai } from '../utils-frontend';
import { setMockUseStateTransitionResponse } from '../setup';
import { currentSphereOrbitNodesAtom } from '../../ui/src/state/orbit';
import mockAppState from './mocks/mockAppState';
import { beforeEach } from 'node:test';

beforeAll(() => {
  setMockUseStateTransitionResponse("Vis", { currentSphereAhB64: mockAppState.spheres.currentSphereHash, currentSphereEhB64: mockAppState.spheres.byHash['uhCAkXt0f6QYXgVlp1E7IWvtd6tULHhLk5_5H6LWU8Xhk'].details.entryHash })
});

afterEach(() => {
  cleanup();
});

describe.only('OrbitTree', () => {
  const renderOrbitTree = () => {
    return <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>{renderVis(OrbitTree)}</MockedProvider>
  }

  test('renders an svg', async () => {
    // Arrange
    const { queryAllByTestId} = renderWithJotai(renderOrbitTree());

    // Assert
    await waitFor(() => {
      expect(queryAllByTestId("svg").length).toBe(1);
    });
  });

  // test('renders the component when needToUpdateCache is false', async () => {
  //   // Mock the state to make needToUpdateCache false
  //   storeMock.get.mockImplementation((atom) => {
  //     if (atom === currentSphereOrbitNodesAtom) {
  //       return { someNode: { sphereHash: 'someHash' } }; // This will make needToUpdateCache false
  //     }
  //     return storeMock.get(atom);
  //   });

  //   // Arrange
  //   const { getByTestId } = renderWithJotai(renderOrbitTree());

  //   // Assert
  //   await waitFor(() => {
  //     expect(screen.getAllByTestId("test-node").length).toBe(1);
  //     expect(screen.getByTestId("svg")).toBeTruthy();
  //   });
  // });
});




// test('renders details about the orbit', async () => {
//   // Arrange
//   const { getByText } = render(
//     <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
//       {WithCurrentOrbitCoordsMockedAtom(renderVis(OrbitTree), {x: 0, y: 0})}</MockedProvider> );

//   const orbitName = ORBITS_MOCKS[0].result.data.orbits!.edges[0].node.name;
  
//   await waitFor(() => {
//     expect(getByText(orbitName)).toBeTruthy();
//   });
// });

// test('renders a loading state, then an orbit tree vis with two nodes', async () => {
//   // Arrange
//   const { container, getByTestId } = render(
//     <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
//       {WithCurrentOrbitCoordsMockedAtom(renderVis(OrbitTree), {x: 0, y: 0})}</MockedProvider> );
  
//   // Assert
//   await waitFor(() => {
//     expect(getByTestId('vis-spinner')).toBeTruthy();
//   });

//   await waitFor(() => {
//     expect(screen.getAllByTestId("test-node").length).toBe(2);
//     expect(screen.getByTestId("svg")).toBeTruthy();
//   });
// });

// test('renders details about two orbits', async () => {
//   // Arrange
//   const { getByText } = render(
//     <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
//       {WithCurrentOrbitCoordsMockedAtom(renderVis(OrbitTree), {x: 0, y: 0})}</MockedProvider> );

//   const mockOrbits = ORBITS_MOCKS[0].result.data.orbits!.edges;
//   const rootOrbitName = mockOrbits[0].node.name;
//   const childOrbitName = mockOrbits[1].node.name;
  
//   await waitFor(() => {
//     expect(getByText(rootOrbitName)).toBeTruthy();
//     expect(getByText(childOrbitName)).toBeTruthy();
//   });
// });