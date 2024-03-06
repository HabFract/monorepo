import React from 'react';
import '@testing-library/jest-dom';
import { expect, describe, test, it } from '@jest/globals';

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { screen, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { WithCurrentOrbitCoordsMockedAtom } from '../utils-frontend';

let x = 0;
let y = 0;
let maxBreadth: number = 0;

// The following are rough versions of what is happening in internal state of jotai atoms.
const incrementBreadth = jest.fn(() => { x += 1 }) as Function;
const incrementDepth = jest.fn(() => { y -= 1 ; }) as Function;
const decrementBreadth = jest.fn(() => { x -= 1  }) as Function;
const decrementDepth = jest.fn(() => { y-=1  }) as Function;


jest.mock("../../app/src/hooks/useNodeTraversal", () => ({
  useNodeTraversal: (_, __) => ({
    incrementBreadth,
    incrementDepth,
    decrementBreadth,
    decrementDepth,
    maxBreadth
  }),
}));

// Mock the value that would be set in the traversal hook to the length of the 'level_trees' array - 1
export function setHierarchyBreadth(num: number) {
  maxBreadth = num
}

describe('Hierarchy Path Templates - after traversing down, it renders path an only child', () => {
  let Tree;
  beforeAll(() => {
    Tree = renderVis(OrbitTree);
  });

  it('by default renders no extra paths', async () => {
    // Arrange
    const { queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );
    
    expect(queryByTestId('path-parent-one-child')).not.toBeTruthy();
    expect(queryByTestId('path-parent-two-children-0')).not.toBeTruthy();
    expect(queryByTestId('path-parent-two-children-1')).not.toBeTruthy();
  });
});

// describe('Hierarchy Path Templates - after traversing down-left, it renders a path for the first child after traversing from the root', () => {
describe('CURRENT', () => {
  let Tree;
  beforeAll(() => {
    Tree = renderVis(OrbitTree);
  });

  function returnRerender(node: React.ReactNode, options) {
    const rendered = render(<MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>{node}</MockedProvider>, options)
    const container = rendered.container;
    console.log('rendered container :>> ', container);
    return {
      ...rendered,
      rerender: (ui, options) =>
        returnRerender(ui, {container, ...options}),
      }
  }

  it('renders a path for the first child after traversing from the root', async () => {
    // Arrange - simulate state before the described traversal 
    const { getByTestId, rerender } = returnRerender(WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0}), undefined);
        
    
    // Arrange - simulate state after the described traversal 
    rerender(WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 1}), undefined);
    setHierarchyBreadth(1) // zero-indexed breadth of 2 on level 1
    
    await waitFor(() => {
      expect(getByTestId('path-parent-two-children-0')).toBeTruthy();
    });

    expect(screen.queryByTestId('path-parent-one-child')).not.toBeTruthy();
    expect(screen.queryByTestId('path-parent-two-children-1')).not.toBeTruthy();
  });
});
