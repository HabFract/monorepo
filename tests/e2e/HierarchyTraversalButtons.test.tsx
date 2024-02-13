import React from 'react';
import '@testing-library/jest-dom';

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { TestProvider } from '../utils-frontend';
import { currentSphere, currentSphereHierarchyBounds, setBreadths, setDepths } from '../../app/src/state/currentSphereHierarchyAtom';
import { SPHERE_ID } from './mocks/spheres';


const Tree = renderVis(OrbitTree);

describe('Hierarchy Path Templates - renders path for parent with 1 child', () => {
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