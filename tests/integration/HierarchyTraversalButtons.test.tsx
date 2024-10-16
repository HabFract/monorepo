import React from 'react';
import { describe, expect, vi, it, beforeEach, afterEach } from 'vitest'
import { HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS } from './mocks/hierarchy-root-2-children-2-grandchildren-unbalanced';


import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../ui/src/components/vis/OrbitTree-2';
import { renderVis } from '../../ui/src/components/vis/helpers';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { WithCurrentOrbitCoordsMockedAtom } from '../utils-frontend';

let x = 0;
let y = 0;
let maxBreadth: number;

// The following are rough versions of what is happening in internal state of jotai atoms.
const incrementBreadth = vi.fn(() => { x += 1 }) as Function;
const incrementDepth = vi.fn(() => { y -= 1; }) as Function;
const decrementBreadth = vi.fn(() => { x -= 1 }) as Function;
const decrementDepth = vi.fn(() => { y -= 1 }) as Function;


vi.mock("../../ui/src/hooks/useNodeTraversal", () => ({
  useNodeTraversal: (_, __) => ({
    incrementBreadth,
    incrementDepth,
    decrementBreadth,
    decrementDepth,
    maxBreadth,
  }),
}));

afterEach(() => {
  cleanup();
});

// Mock the value that would be set in the traversal hook to the length of the 'level_trees' array - 1
export function setHierarchyBreadth(num: number) {
  maxBreadth = num
}

describe.skip('Hierarchy Traversal -  renders traversal buttons for parent with 1 child', () => {
  let Tree;
  beforeEach(() => {
    Tree = renderVis(OrbitTree);
  });

  it('renders traversal button for going down a level', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 0 })}</MockedProvider>);

    setHierarchyBreadth(0);

    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-down')).toBeTruthy();
    });

    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-up')).not.toBeTruthy();
  });

  it('given y = 1, renders traversal button for going up a level', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 1 })}</MockedProvider>);

    setHierarchyBreadth(0);

    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-up')).toBeTruthy();
    });

    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });
});

describe.skip('Hierarchy Traversal - it renders traversal buttons and triggers events - parent with 2 children', () => {
  let Tree;
  beforeEach(() => {
    Tree = renderVis(OrbitTree);
  });

  it('initially renders traversal button for going down a level', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 0 })}</MockedProvider>);

    setHierarchyBreadth(0);

    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-down-left')).toBeTruthy();
    });
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-up')).not.toBeTruthy();
  });

  it('when you click that button, it triggers internal currentSphereHierarchyIndices state to increment y', async () => {
    // Arrange
    const { getByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 0 })}</MockedProvider>);

    // Act
    await waitFor(() => {
      expect(getByTestId('traversal-button-down-left')).toBeTruthy();
    });
    const traversalButton = getByTestId('traversal-button-down-left');
    fireEvent.click(traversalButton);

    // Assert
    await waitFor(() => {
      expect(incrementDepth).toHaveBeenCalled();
    });
  });

  it('when you click the up button, it triggers internal currentSphereHierarchyIndices state to decrement y', async () => {
    // Arrange
    const { getByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 1 })}</MockedProvider>);

    // Mock state for 'level breadth' that is used to determine which buttons appear
    setHierarchyBreadth(1)

    // Act
    await waitFor(() => {
      expect(getByTestId('traversal-button-up')).toBeTruthy();
    });
    const traversalButton = getByTestId('traversal-button-up');
    fireEvent.click(traversalButton);

    // Assert
    await waitFor(() => {
      expect(decrementDepth).toHaveBeenCalled();
    });
  });

  it('when you click the right button, it triggers internal currentSphereHierarchyIndices state to increment x', async () => {
    // Arrange
    const { getByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 1 })}</MockedProvider>);

    // Mock state for 'level breadth' that is used to determine which buttons appear
    setHierarchyBreadth(1)

    // Act
    await waitFor(() => {
      expect(getByTestId('traversal-button-right')).toBeTruthy();
    });
    const traversalButton = getByTestId('traversal-button-right');
    fireEvent.click(traversalButton);

    // Assert
    await waitFor(() => {
      expect(incrementBreadth).toHaveBeenCalled();
    });
  });

  it('when you click the left button, it triggers internal currentSphereHierarchyIndices state to decrement x', async () => {
    // Arrange
    const { getByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 1, y: 1 })}</MockedProvider>);

    // Mock state for 'level breadth' that is used to determine which buttons appear
    setHierarchyBreadth(1)

    // Act
    await waitFor(() => {
      expect(getByTestId('traversal-button-left')).toBeTruthy();
    });
    const traversalButton = getByTestId('traversal-button-left');
    fireEvent.click(traversalButton);

    // Assert
    await waitFor(() => {
      expect(decrementBreadth).toHaveBeenCalled();
    });
  });

  it('given y = 1, renders traversal buttons for going up a level/right', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 1 })}</MockedProvider>);

    // Mock state for 'level breadth' that is used to determine which buttons appear
    setHierarchyBreadth(1)

    // Test state for y = 1
    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-up')).toBeTruthy();
      expect(getByTestId('traversal-button-right')).toBeTruthy();
    });
    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });

  it('given x=1, y = 1, renders traversal buttons for going up a level/left', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 1, y: 1 })}</MockedProvider>);

    setHierarchyBreadth(1)

    // Test state for x=1, y = 1
    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-up')).toBeTruthy();
      expect(getByTestId('traversal-button-left')).toBeTruthy();
    });
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });
});

describe.skip('Hierarchy Traversal - it renders traversal buttons and triggers events - unbalanced tree with 2 children and 2 grandchildren (for depth first side)', () => {
  let Tree;
  beforeEach(() => {
    Tree = renderVis(OrbitTree);
  });


  it('initially renders traversal button for going down a level', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 0 })}</MockedProvider>);

    setHierarchyBreadth(0);

    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-down-left')).toBeTruthy();
    });
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-up')).not.toBeTruthy();
  });

  it('given x = 0,  y = 1, renders traversal buttons for going up OR down a level/right', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 1 })}</MockedProvider>);

    // Mock state for 'level breadth' that is used to determine which buttons appear
    setHierarchyBreadth(1)

    // Test state for y = 1
    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-up')).toBeTruthy();
      expect(getByTestId('traversal-button-right')).toBeTruthy();
      expect(getByTestId('traversal-button-down-left')).toBeTruthy();
    });
    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });

  it('given x = 0,  y = 2, renders traversal buttons for going up a level/right', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 0, y: 2 })}</MockedProvider>);

    // Mock state for 'level breadth' that is used to determine which buttons appear
    setHierarchyBreadth(1)

    // Test state for y = 2
    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-up')).toBeTruthy();
      expect(getByTestId('traversal-button-right')).toBeTruthy();
    });

    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });

  it('given x = 1,  y = 2, renders traversal buttons for going up a level/left', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 1, y: 2 })}</MockedProvider>);

    // Mock state for 'level breadth' that is used to determine which buttons appear
    setHierarchyBreadth(1)

    // Test state for x=1, y = 2
    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-up')).toBeTruthy();
      expect(getByTestId('traversal-button-left')).toBeTruthy();
    });

    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });

  it('given x = 1, y = 1, renders traversal buttons for going up a level/left', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, { x: 1, y: 1 })}</MockedProvider>);

    setHierarchyBreadth(1)

    // Test state for x=1, y = 1
    // Assert
    await waitFor(() => {
      expect(getByTestId('traversal-button-up')).toBeTruthy();
      expect(getByTestId('traversal-button-left')).toBeTruthy();
    });
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });
});
