import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAtom } from 'jotai';
import { currentSphereAtom, nodeWinDataAtom, setWinForNode, calculateStreakAtom, calculateCompletionStatusAtom } from '../../ui/src/state/selectors';
import mockAppState from '../integration/mocks/mockAppState';
import { TestProvider } from '../utils-frontend';
import { appStateAtom } from '../../ui/src/state/store';


describe('currentSphereAtom', () => {
  it('should return the current sphere when it exists', () => {
    const TestComponent = () => {
      const [currentSphere] = useAtom(currentSphereAtom);
      return <div>{JSON.stringify(currentSphere)}</div>;
    };

    render(
      <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
        <TestComponent />
      </TestProvider>
    );
    const sphere = mockAppState.spheres.spheres.sphere1;
    const expectedSphere = JSON.stringify(sphere);
    expect(screen.getByText(expectedSphere)).toBeTruthy();
  });

  it('should return undefined when the current sphere does not exist', () => {
    const modifiedMockState = {
      ...mockAppState,
      spheres: {
        ...mockAppState.spheres,
        currentSphereHash: 'nonexistentSphere',
      },
    };

    const TestComponent = () => {
      const [currentSphere] = useAtom(currentSphereAtom);
      return <div data-testid="container">{JSON.stringify(currentSphere)}</div>;
    };

    render(
      <TestProvider initialValues={[[appStateAtom, modifiedMockState]]}>
        <TestComponent />
      </TestProvider>
    );

    expect(screen.getByTestId("container").innerText).not.toBeTruthy();
  });

  it('should return undefined when the spheres object is empty', () => {
    const modifiedMockState = {
      ...mockAppState,
      spheres: {
        currentSphereHash: '',
        spheres: {},
      },
    };

    const TestComponent = () => {
      const [currentSphere] = useAtom(currentSphereAtom);
      return <div data-testid="container">{JSON.stringify(currentSphere)}</div>;
    };

    render(
      <TestProvider initialValues={[[appStateAtom, modifiedMockState]]}>
        <TestComponent />
      </TestProvider>
    );

    expect(screen.getByTestId("container").innerText).not.toBeTruthy();
  });
});

describe('nodeWinDataAtom', () => {
  it('should return win data when it exists for a node', () => {
    const TestComponent = () => {
      const [winData] = useAtom(nodeWinDataAtom('orbit1'));
      return <div>{JSON.stringify(winData)}</div>;
    };

    render(
      <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
        <TestComponent />
      </TestProvider>
    );

    const expectedWinData = JSON.stringify(mockAppState.wins.orbit1);
    expect(screen.getByText(expectedWinData)).toBeTruthy();
  });
});
//   it('should return an empty object when win data doesn\'t exist for a node', () => {
//     const TestComponent = () => {
//       const [winData] = useAtom(nodeWinDataAtom('nonexistentOrbit'));
//       return <div>{JSON.stringify(winData)}</div>;
//     };

//     render(
//       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
//         <TestComponent />
//       </TestProvider>
//     );

//     expect(screen.getByText('{}')).toBeTruthy();
//   });

//   it('should return correct win data for a node with multiple wins per day', () => {
//     const TestComponent = () => {
//       const [winData] = useAtom(nodeWinDataAtom('orbit2'));
//       return <div>{JSON.stringify(winData)}</div>;
//     };

//     render(
//       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
//         <TestComponent />
//       </TestProvider>
//     );

//     const expectedWinData = JSON.stringify(mockAppState.wins.orbit2);
//     expect(screen.getByText(expectedWinData)).toBeTruthy();
//   });

//   it('should return correct win data for a node with weekly frequency', () => {
//     const TestComponent = () => {
//       const [winData] = useAtom(nodeWinDataAtom('orbit3'));
//       return <div>{JSON.stringify(winData)}</div>;
//     };

//     render(
//       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
//         <TestComponent />
//       </TestProvider>
//     );

//     const expectedWinData = JSON.stringify(mockAppState.wins.orbit3);
//     expect(screen.getByText(expectedWinData)).toBeTruthy();
//   });
// });