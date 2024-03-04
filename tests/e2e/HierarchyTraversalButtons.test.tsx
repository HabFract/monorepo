import React from 'react';
import '@testing-library/jest-dom';
import { expect, describe, test, it } from '@jest/globals';

import { createPortal } from "react-dom";
import { MockedProvider } from '@apollo/client/testing';
import OrbitTree from '../../app/src/components/vis/OrbitTree';
import { renderVis } from '../../app/src/components/vis/helpers';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { HIERARCHY_ROOT_ONE_CHILD_MOCKS } from './mocks/hierarchy-root-1-child';
import { HIERARCHY_ROOT_TWO_CHILDREN_MOCKS } from './mocks/hierarchy-root-2-children';
import { WithCurrentSphereMockedAtom } from '../utils-frontend';

describe('Hierarchy Traversal - renders traversal buttons for parent with 1 child', () => {
  let Tree, container;
  beforeEach(() => {
    Tree = renderVis(OrbitTree);

    container = document.createElement("div");
    container.id = 'root';
    document.body.appendChild(container);
    debugger;
  });

  it('renders traversal button for going down a level', async () => {
    const { getByTestId, queryByTestId } = render(

    createPortal(<MockedProvider mocks={HIERARCHY_ROOT_ONE_CHILD_MOCKS} addTypename={false}>
      {WithCurrentSphereMockedAtom(Tree)}
      </MockedProvider>, container),
      { container: container }
    );

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

describe('Hierarchy Path Templates - renders traversal buttons for parent with 2 children', () => {
  let Tree;
  beforeEach(() => {
    Tree = renderVis(OrbitTree);
  });

  it('renders traversal button for going down a level', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentSphereMockedAtom(Tree)}
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('traversal-button-down-left')).toBeTruthy();
      screen.debug()
    });
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-up')).not.toBeTruthy();
  });

  it('given the down button was clicked, it renders traversal buttons for going right/up', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentSphereMockedAtom(Tree)}
      </MockedProvider>
    );

    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-down-left');
      fireEvent.click(traversalButton);
    });

    await waitFor(() => {
      expect(getByTestId('traversal-button-right')).toBeTruthy();
      expect(getByTestId('traversal-button-up')).toBeTruthy();
    });
    expect(queryByTestId('traversal-button-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });

  it('given the down button was clicked, and then the right button was clicked, it renders traversal buttons for going left/up', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={HIERARCHY_ROOT_TWO_CHILDREN_MOCKS} addTypename={false}>
        {WithCurrentSphereMockedAtom(Tree)}
      </MockedProvider>
    );

    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-down-left');
      fireEvent.click(traversalButton);
    });
    await waitFor(() => {
      const traversalButton = getByTestId('traversal-button-right');
      fireEvent.click(traversalButton);
    });

    await waitFor(() => {
      expect(getByTestId('traversal-button-left')).toBeTruthy();
      expect(getByTestId('traversal-button-up')).toBeTruthy();
    });
    expect(queryByTestId('traversal-button-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-right')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down-left')).not.toBeTruthy();
    expect(queryByTestId('traversal-button-down')).not.toBeTruthy();
  });
});