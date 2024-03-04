import React from 'react';
import '@testing-library/jest-dom';
import { expect, describe, test, it } from '@jest/globals';

import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { WithCurrentSphereMockedAtom } from '../utils-frontend';

describe('Hierarchy Path Templates - after traversing down, it renders path an only child', () => {
  let Tree;
  beforeAll(() => {
    Tree = renderVis(OrbitTree);
  });
  afterAll(() => {
    Tree = undefined;
  });

  it('CURRENT renders a path for the only child after traversing from the root', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
          {WithCurrentSphereMockedAtom(Tree)}
      </MockedProvider>
    );

    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-down');
      fireEvent.click(traversalButton);
    });

    await waitFor(() => {
      expect(getByTestId('path-parent-one-child')).toBeTruthy();
    });
  });
});

describe('Hierarchy Path Templates - after traversing down-left, it renders a path for the first child after traversing from the root', () => {
  let Tree;
  beforeAll(() => {
    Tree = renderVis(OrbitTree);
  });
  afterAll(() => {
    Tree = undefined;
  });
  
  it('renders a path for the first child after traversing from the root', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentSphereMockedAtom(Tree)}
      </MockedProvider>
    );
    
    await waitFor(async () => {
      const traversalButton = getByTestId('traversal-button-down-left');
      await fireEvent.click(traversalButton);
    });
    
    await waitFor(() => {
      expect(getByTestId('path-parent-two-children-0')).toBeTruthy();
    });
  });
});
