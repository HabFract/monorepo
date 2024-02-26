import React from 'react';
import '@testing-library/jest-dom';
import { expect, describe, test, it } from '@jest/globals';

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { WithCurrentSphereMockedAtom } from '../utils-frontend';

const Tree = renderVis(OrbitTree);
describe('Hierarchy Path Templates - renders path for parent with 1 child', () => {
  const { getByTestId } = render(
    <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
        {WithCurrentSphereMockedAtom(Tree)}
    </MockedProvider>
  );

  it('renders a path for the only child after traversing from the root', async () => {
    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-down');
      fireEvent.click(traversalButton);
    });

    await waitFor(() => {
      expect(getByTestId('path-parent-one-child')).toBeTruthy();
    });
  });
});


describe('Hierarchy Path Templates - renders traversal buttons for parent with 2 children', () => {
  let Tree;
  beforeEach(() => {
    Tree = renderVis(OrbitTree);
  });

  const { getByTestId, queryByTestId } = render(
    <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
      {WithCurrentSphereMockedAtom(Tree)}
    </MockedProvider>
  );

  it('aafg', async () => {
    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-down-left');
      fireEvent.click(traversalButton);
    });
    await new Promise((r) => setTimeout(r, 2000));

    await waitFor(() => {
      
      screen.debug()
      expect(getByTestId('traversal-button-right')).toBeTruthy();
      expect(getByTestId('traversal-button-up')).toBeTruthy();
    });

    // await waitFor(async () => {
    //   const traversalButton = getByTestId('traversal-button-down-left');
    //   await fireEvent.click(traversalButton);
    // });
    // screen.debug()
    
    // await waitFor(() => {
    //   expect(queryByTestId('path-parent-two-children-0')).toBeTruthy();
    // });
});
});
