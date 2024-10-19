import React from 'react';
import { expect, test, it, afterEach, describe, beforeAll, vi } from 'vitest'
import { render, waitFor, screen, act, cleanup } from '@testing-library/react';
  
import OrbitTree from '../../ui/src/components/vis/OrbitTree';

import { HIERARCHY_MOCKS } from './mocks/hierarchy-root-only';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { renderWithJotai, renderVis } from '../utils-frontend';;
import { currentSphereOrbitNodesAtom } from '../../ui/src/state/orbit';
import mockAppState from './mocks/mockAppState';
import { resetMocks, setMockUseStateTransitionResponse } from '../setup';
import { addCustomMock, clearCustomMocks, mockedCacheEntries, mockStore } from '../setupMockStore';

beforeAll(() => {
  resetMocks()
  clearCustomMocks();
  setMockUseStateTransitionResponse("Vis")
  addCustomMock('all', mockedCacheEntries);
});

afterEach(() => {
  cleanup();
});

vi.mock("../../ui/src/state/store", async (importOriginal) => {
  const atomMappings = {
    currentSphereHashes: {
      entryHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
      actionHash: "uhCAkXt0f6QYXgVlp1E7IWvtd6tULHhLk5_5H6LWU8Xhk",
    },
    currentSphereDetailsAtom: {
      entryHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
      name: "Health and Fitness",
      description: "Focus on physical health, exercise, and nutrition.",
      hashtag: "fitness",
      image: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==",
    },
    currentSphereHierarchyIndices: { x: 0, y: 0 },
    currentSphereHierarchyBounds: { minBreadth: 0, maxBreadth: 2, minDepth: 0, maxDepth: 2 },
  };
  const store = {
    get: (atom) => {
      return atomMappings[atom.testId] || console.log(atom.toString());
    },
    set: (atom) => {
      return mockStore.store.set(atom);
    },
    sub: (atom, cb) => {
      return mockStore.store.sub(atom, cb);
    },
  };
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    store,
  };
});

describe.only('OrbitTree', () => {
  test('renders an svg', async () => {
    // Arrange
    renderWithJotai(renderVis(OrbitTree) as any, {initialHierarchy: HIERARCHY_MOCKS} as any);

    // Assert
    await waitFor(async () => {
      expect(screen.queryAllByTestId("svg").length).toBe(1);
    });
  });
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