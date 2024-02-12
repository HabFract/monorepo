import React from 'react';

import '@testing-library/jest-dom'
import { render, waitFor, screen } from '@testing-library/react';

import { useHydrateAtoms } from 'jotai/utils'
import { Provider } from 'jotai'
import nodeStore from '../../app/src/state/jotaiKeyValueStore';


import { renderVis } from '../../app/src/components/vis/helpers';
import OrbitTree from '../../app/src/components/vis/OrbitTree';

import { HIERARCHY_MOCKS } from './mocks/hierarchy-root-only';
import { ORBITS_MOCKS } from './mocks/orbits';
import { MockedProvider } from '@apollo/client/testing';


const Tree = renderVis(OrbitTree);

const HydrateAtoms = ({ initialValues, children }) => {
  useHydrateAtoms(initialValues)
  return children
}

const TestProvider = ({ initialValues, children }) => (
  <Provider>
    <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
  </Provider>
)

const mockedCacheEntries = [
  [
    'SGVhbHRoMQ==e___R28gZm9yIGEgd2Fsay==',
    {
      id: 'R28gZm9yIGEgd2Fsay==',
      name: 'Go for a walk',
      scale: 'Atom',
      description: 'A daily walk to improve cardiovascular health.',
      startTime: 1617235200,
      endTime: 1617321600
    }
  ],
  [
    'SGVhbHRoMQ==e___TGlmdCB3ZWlnaHRz',
    {
      id: 'TGlmdCB3ZWlnaHRz',
      name: 'Lift weights',
      scale: 'Atom',
      description: 'Strength training to build muscle and increase metabolism.',
      startTime: 1617235200,
      endTime: 1617321600
    }
  ],
  [
    'SGVhbHRoMQ==e___TWFrZSBhIGhlYWx0aHkgbWVhbA==',
    {
      id: 'TWFrZSBhIGhlYWx0aHkgbWVhbA==',
      name: 'Make a healthy meal',
      scale: 'Atom',
      description: 'Preparing nutritious meals to fuel the body for optimal health.',
      startTime: 1617235200,
      endTime: 1617321600
    }
  ],
  [
    'SGVhbHRoMQ==e___UHJhY3RpY2UgeW9nYQ==',
    {
      id: 'UHJhY3RpY2UgeW9nYQ==',
      name: 'Practice yoga',
      scale: 'Atom',
      description: 'Engage in yoga to enhance flexibility, strength, and mental clarity.',
      startTime: 1617235200,
      endTime: 1617321600
    }
  ]
]

test('renders a loading state, then an orbit tree vis with a node', async () => {
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      <TestProvider initialValues={[[nodeStore.setMany, mockedCacheEntries]]}>
        {(Tree)}
      </TestProvider>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('Loading!')).toBeInTheDocument();
  });

  await waitFor(() => {
    
    // screen.debug()
    expect(screen.getByTestId("test-node")).toBeInTheDocument();
    expect(screen.getByTestId("svg")).toBeInTheDocument();
  });
});

test('renders details about the orbit', async () => {
  const { getByText } = render(
    <MockedProvider mocks={HIERARCHY_MOCKS} addTypename={false}>
      {(Tree)}
    </MockedProvider>
  );

  const orbitName = ORBITS_MOCKS[0].result.data.orbits.edges[0].node.name;

  await waitFor(() => {
    expect(getByText(orbitName)).toBeInTheDocument();
  });

});