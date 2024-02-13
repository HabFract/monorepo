import React from 'react';
import '@testing-library/jest-dom';

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { TestProvider } from '../utils-frontend';
import { currentSphere, currentSphereHierarchyBounds, setBreadths, setDepths } from '../../app/src/state/currentSphereHierarchyAtom';
import { SPHERE_ID } from './mocks/spheres';


const Tree = renderVis(OrbitTree);

describe.skip('Hierarchy Traversal - renders traversal buttons for parent with 1 child', () => {
  it('renders traversal button for going down a level', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
        <TestProvider initialValues={[
          [currentSphere, { entryHash: SPHERE_ID, actionHash: SPHERE_ID }],
        ]}>
          {(Tree)}
        </TestProvider>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('traversal-button-down')).toBeInTheDocument();
    });
    expect(queryByTestId('traversal-button-left')).not.toBeInTheDocument();
    expect(queryByTestId('traversal-button-right')).not.toBeInTheDocument();
    expect(queryByTestId('traversal-button-up')).not.toBeInTheDocument();
  });
});

describe.skip('Hierarchy Path Templates - renders traversal buttons for parent with 2 children', () => {
  it('renders traversal button for going down a level', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        <TestProvider initialValues={[
          [currentSphere, { entryHash: SPHERE_ID, actionHash: SPHERE_ID }],
        ]}>
          {(Tree)}
        </TestProvider>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('traversal-button-down')).toBeInTheDocument();
    });
    expect(queryByTestId('traversal-button-left')).not.toBeInTheDocument();
    expect(queryByTestId('traversal-button-right')).not.toBeInTheDocument();
    expect(queryByTestId('traversal-button-up')).not.toBeInTheDocument();
  });

  it('given the down button was clicked, it renders traversal buttons for going right/up', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        <TestProvider initialValues={[
          [currentSphere, { entryHash: SPHERE_ID, actionHash: SPHERE_ID }],
        ]}>
          {(Tree)}
        </TestProvider>
      </MockedProvider>
    );

    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-down');
      fireEvent.click(traversalButton);
    });

    await waitFor(() => {
      expect(getByTestId('traversal-button-right')).toBeInTheDocument();
      expect(getByTestId('traversal-button-up')).toBeInTheDocument();
    });
    expect(queryByTestId('traversal-button-left')).not.toBeInTheDocument();
    // expect(queryByTestId('traversal-button-down')).not.toBeInTheDocument(); //TODO: fix levels window/depth upper bounds
  });

  it('given the down button was clicked, and then the right button was clicked, it renders traversal buttons for going left/up', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        <TestProvider initialValues={[
          [currentSphere, { entryHash: SPHERE_ID, actionHash: SPHERE_ID }],
        ]}>
          {(Tree)}
        </TestProvider>
      </MockedProvider>
    );

    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-down');
      fireEvent.click(traversalButton);
    });
    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-right');
      fireEvent.click(traversalButton);
    });

    await waitFor(() => {
      expect(getByTestId('traversal-button-left')).toBeInTheDocument();
      expect(getByTestId('traversal-button-up')).toBeInTheDocument();
    });
    expect(queryByTestId('traversal-button-right')).not.toBeInTheDocument();
    // expect(queryByTestId('traversal-button-down')).not.toBeInTheDocument(); //TODO: fix levels window/depth upper bounds
  });
});