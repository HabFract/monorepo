import React from 'react';
import '@testing-library/jest-dom';

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { TestProvider } from '../utils-frontend';
import { currentSphere } from '../../app/src/state/currentSphereHierarchyAtom';
import { SPHERE_ID } from './mocks/spheres';


const Tree = renderVis(OrbitTree);

describe('Hierarchy Path Templates - renders path for parent with 1 child', () => {
  it('renders a path for the only child after traversing from the root', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
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
      expect(getByTestId('path-parent-one-child')).toBeInTheDocument();
    });
  });
});

// describe('Hierarchy Path Templates - renders path for parent with 2 children', () => {
//   const { getByText } = render(
//     <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
//         {(Tree)}
//     </MockedProvider>
//   );

//   it('renders path for parent with one child', async () => {
//     const { getByTestId } = render(
//       <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
//           {(Tree)}
//       </MockedProvider>
//     );

//     await waitFor(() => {
//       expect(getByTestId('path-parent-one-child')).toBeInTheDocument();
//     });
//   });
// });
