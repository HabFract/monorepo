import React from 'react';
import '@testing-library/jest-dom'
import { expect, describe, test, it } from '@jest/globals';
import { render, waitFor, screen, act } from '@testing-library/react';

import { renderVis } from '../../app/src/components/vis/helpers';

import OrbitTree from '../../app/src/components/vis/OrbitTree';

import { HIERARCHY_MOCKS } from './mocks/hierarchy-root-only';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';
import { WithCurrentOrbitCoordsMockedAtom } from '../utils-frontend';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';

test('renders a loading state, then an orbit tree vis with one node', async () => {
  let Tree = renderVis(OrbitTree);

  // Arrange
  const { getByText, getAllByTestId } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );
  
  // Assert
  await waitFor(() => {
    expect(getByText('Loading!')).toBeTruthy();
  });

  await waitFor(() => {
    expect(screen.getAllByTestId("test-node").length).toBe(1);
    expect(screen.getByTestId("svg")).toBeTruthy();
  });
});

test('renders details about the orbit', async () => {
  let Tree = renderVis(OrbitTree);
  
  // Arrange
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );

  const orbitName = ORBITS_MOCKS[0].result.data.orbits!.edges[0].node.name;
  
  await waitFor(() => {
    expect(getByText(orbitName)).toBeTruthy();
  });
});

test('renders a loading state, then an orbit tree vis with two nodes', async () => {
  let Tree = renderVis(OrbitTree);

  // Arrange
  const { getByText, getAllByTestId } = render(
    <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
      {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );
  
  // Assert
  await waitFor(() => {
    expect(getByText('Loading!')).toBeTruthy();
  });

  await waitFor(() => {
    expect(screen.getAllByTestId("test-node").length).toBe(2);
    expect(screen.getByTestId("svg")).toBeTruthy();
  });
});

test('renders details about two orbits', async () => {
  let Tree = renderVis(OrbitTree);
  
  // Arrange
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
      {WithCurrentOrbitCoordsMockedAtom(Tree, {x: 0, y: 0})}</MockedProvider> );

  const mockOrbits = ORBITS_MOCKS[0].result.data.orbits!.edges;
  const rootOrbitName = mockOrbits[0].node.name;
  const childOrbitName = mockOrbits[1].node.name;
  
  await waitFor(() => {
    expect(getByText(rootOrbitName)).toBeTruthy();
    expect(getByText(childOrbitName)).toBeTruthy();
  });
});