import React from 'react';
import '@testing-library/jest-dom';

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';


const Tree = renderVis(OrbitTree);

describe('Hierarchy Path Templates - renders path for parent with 1 child', () => {
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
        {(Tree)}
    </MockedProvider>
  );

  it('renders path for parent with one child', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
          {(Tree)}
      </MockedProvider>
    );

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
