import React from 'react';
import '@testing-library/jest-dom';
import { expect, describe, test, it } from '@jest/globals';

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { WithCurrentOrbitCoordsMockedAtom } from '../utils-frontend';

let x = 0;
let y = 0;
let maxBreadth: number;

const incrementBreadth = jest.fn(() => { x = 1 }) as Function;
const incrementDepth = jest.fn(() => { y = 1 ; }) as Function;
const decrementBreadth = jest.fn(() => { x = 0  }) as Function;
const decrementDepth = jest.fn(() => { y-=1  }) as Function;


jest.mock("../../app/src/hooks/useNodeTraversal", () => ({
  useNodeTraversal: (_, __) => ({
    incrementBreadth,
    incrementDepth,
    decrementBreadth,
    decrementDepth,
    maxBreadth,
  }),
}));

export function setHierarchyBreadth(num: number) {
  maxBreadth = num
}

describe('Hierarchy Traversal -  renders traversal buttons for parent with 1 child', () => {
  let Tree;
  beforeEach(() => {
    Tree = renderVis(OrbitTree);
  });
  afterAll(() => {
    Tree = undefined;
  });

  it('renders traversal button for going down a level', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );

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
});

describe('Hierarchy Path Templates - it renders traversal buttons and triggers events - parent with 2 children', () => {
  let Tree;
  beforeEach(() => {
    Tree = renderVis(OrbitTree);
  });
  afterAll(() => {
    Tree = undefined;
  });


  it('initially renders traversal button for going down a level', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );

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
  
  it('when you click that button, it triggers internal currentOrbitCoords state to increment y', async () => {
    // Arrange
    const { getByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x, y})}</MockedProvider> );

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

  it('given y = 1, renders traversal buttons for going up a level/right', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 1})}</MockedProvider> );

      setHierarchyBreadth(1)

      // Test state for y = 1
      // Assert
      await waitFor(() => {
        expect(getByTestId('traversal-button-up')).toBeTruthy();
        expect(getByTestId('traversal-button-right')).toBeTruthy();
      });
      expect(queryByTestId('traversal-button-up-left')).not.toBeTruthy();
      expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
      expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
      expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
      expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });

  it('given x=1, y = 1, renders traversal buttons for going up a level/right', async () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 1, y: 1})}</MockedProvider> );

      setHierarchyBreadth(1)

      // Test state for x=1, y = 1
      // Assert
      await waitFor(() => {
        expect(getByTestId('traversal-button-up')).toBeTruthy();
        expect(getByTestId('traversal-button-left')).toBeTruthy();
      });
      expect(queryByTestId('traversal-button-up-left')).not.toBeTruthy();
      expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
      expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
      expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
      expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });
});