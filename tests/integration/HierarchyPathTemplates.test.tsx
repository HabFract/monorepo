import React from 'react';
import { describe, expect, vi, it, afterEach, beforeAll } from 'vitest'

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../ui/src/components/vis/OrbitTree';
import { renderVis } from '../../ui/src/components/vis/helpers';
import { cleanup, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { WithCurrentOrbitCoordsMockedAtom } from '../utils-frontend';
import { HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS } from './mocks/hierarchy-root-2-children-2-grandchildren-unbalanced';
import { HIERARCHY_ROOT_THREE_CHILDREN } from './mocks/hierarchy-root-3-children';
import { HIERARCHY_MOCKS } from './mocks/hierarchy-root-only';

let x = 0;
let y = 0;
let maxBreadth: number = 0;

// The following are rough versions of what is happening in internal state of jotai atoms.
const incrementBreadth = vi.fn(() => { x += 1 }) as Function;
const incrementDepth = vi.fn(() => { y -= 1 ; }) as Function;
const decrementBreadth = vi.fn(() => { x -= 1  }) as Function;
const decrementDepth = vi.fn(() => { y-=1  }) as Function;


vi.mock("../../ui/src/hooks/useNodeTraversal", () => ({
  useNodeTraversal: (_, __) => ({
    incrementBreadth,
    incrementDepth,
    decrementBreadth,
    decrementDepth,
    maxBreadth
  }),
}));

afterEach(() => {
  cleanup();
});

// Mock the value that would be set in the traversal hook to the length of the 'level_trees' array - 1
export function setHierarchyBreadth(num: number) {
  maxBreadth = num
}

describe('Hierarchy Path Templates - without traversing, it renders no paths', () => {
  let Tree;
  beforeAll(() => {
    Tree = renderVis(OrbitTree);
  });

  it('HIERARCHY_ROOT_ONLY by default renders no extra paths', async () => {
    // Arrange
    const { queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );

    await waitFor(() => {
      expect(queryByTestId('path-', {exact: false})).toBeNull();
    });
  });

  it('HIERARCHY_ROOT_ONE_CHILD by default renders no extra paths', async () => {
    // Arrange
    const { queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );

    await waitFor(() => {
      expect(queryByTestId('path-', {exact: false})).toBeNull();
    });
  });

  it('HIERARCHY_ROOT_TWO_CHILDREN by default renders no extra paths', async () => {
    // Arrange
    const { queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );

    await waitFor(() => {
      expect(queryByTestId('path-', {exact: false})).toBeNull();
    });
  });

  it('HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED by default renders no extra paths', async () => {
    // Arrange
    const { queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );

    await waitFor(() => {
      expect(queryByTestId('path-', {exact: false})).toBeNull();
    });
  });
});

describe('Hierarchy Path Templates - One root, one child - after traversing down from the root it renders a path for the first child', () => {
  let Tree;
  beforeAll(() => {
    Tree = renderVis(OrbitTree);
  });

  it('renders a path for the first child after traversing', async () => {
    // Arrange - simulate state after the described traversal 
    const { getByTestId } = render(
        <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
          {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 1})}</MockedProvider> );
    setHierarchyBreadth(0) // zero-indexed breadth of 1 on level 1
    
    await waitFor(() => {
      expect(getByTestId('path-parent-one-child')).toBeTruthy();
    });
  });
});

describe('Hierarchy Path Templates - One root, two children - after traversing it renders correct path for that child', () => {
  let Tree;
  beforeAll(() => {
    Tree = renderVis(OrbitTree);
  });

  it('after traversing down-left, it renders a path for the first child', async () => {
    // Arrange - simulate state after the described traversal 
    const { getByTestId } = render(
        <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
          {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 1})}</MockedProvider> );
    setHierarchyBreadth(1) // zero-indexed breadth of 2 on level 1
    
    await waitFor(() => {
      expect(getByTestId('path-parent-two-children-0')).toBeTruthy();
    });
  });

  it('after traversing down-right, it renders a path for the second child', async () => {
    // Arrange - simulate state after the described traversal 
    const { getByTestId } = render(
        <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
          {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 1, y: 1})}</MockedProvider> );
    setHierarchyBreadth(1) // zero-indexed breadth of 2 on level 1
    
    await waitFor(() => {
      expect(getByTestId('path-parent-two-children-1')).toBeTruthy();
    });
  });
});

describe('Hierarchy Path Templates - One root, three children - after traversing it renders correct path for that child', () => {
  let Tree;
  beforeAll(() => {
    Tree = renderVis(OrbitTree);
  });

  it('after traversing down-left, it renders a path for the first child', async () => {
    // Arrange - simulate state after the described traversal 
    const { getByTestId } = render(
        <MockedProvider mocks={HIERARCHY_ROOT_THREE_CHILDREN} addTypename={false}>
          {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 1})}</MockedProvider> );
    setHierarchyBreadth(2) // zero-indexed breadth of 3 on level 1
    
    await waitFor(() => {
      expect(getByTestId('path-parent-three-children-0')).toBeTruthy();
    });
  });

  it('after traversing down, then right, it renders a path for the second child', async () => {
    // Arrange - simulate state after the described traversal 
    const { getByTestId } = render(
        <MockedProvider mocks={HIERARCHY_ROOT_THREE_CHILDREN} addTypename={false}>
          {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 1, y: 1})}</MockedProvider> );
    setHierarchyBreadth(2) // zero-indexed breadth of 3 on level 1
    
    await waitFor(() => {
      expect(getByTestId('path-parent-one-child')).toBeTruthy(); // Middle child will have the same path as the single child 
    });
  });

  it('after traversing down, then right twice, it renders a path for the third child', async () => {
    // Arrange - simulate state after the described traversal 
    const { getByTestId } = render(
        <MockedProvider mocks={HIERARCHY_ROOT_THREE_CHILDREN} addTypename={false}>
          {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 2, y: 1})}</MockedProvider> );
    setHierarchyBreadth(2) // zero-indexed breadth of 3 on level 1
    
    await waitFor(() => {
      expect(getByTestId('path-parent-three-children-2')).toBeTruthy();
    });
  });
});