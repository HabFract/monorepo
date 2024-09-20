import React, { useMemo } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAtom } from 'jotai';
import { currentSphereAtom, nodeWinDataAtom, setWinForNode, calculateStreakAtom, calculateCompletionStatusAtom, getOrbitFrequency } from '../../ui/src/state/selectors';
import mockAppState from '../integration/mocks/mockAppState';
import { TestProvider } from '../utils-frontend';
import { appStateAtom } from '../../ui/src/state/store';
import { Frequency } from '../../ui/src/state/types/orbit';

describe('State selectors', () => {
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

  describe('getOrbitFrequency', () => {
    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const [frequency] = useAtom(useMemo(() => getOrbitFrequency(orbitId), [orbitId]));
      return <div data-testid="frequency">{frequency}</div>;
    };

    it('should return the correct frequency for daily orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId="orbit1" />
        </TestProvider>
      );

      expect(screen.getByTestId('frequency').textContent).toBe(Frequency.DAILY_OR_MORE.DAILY.toString());
    });

    it('should return the correct frequency for weekly orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId="orbit2" />
        </TestProvider>
      );
      expect(screen.getByTestId('frequency').textContent).toBe(Frequency.LESS_THAN_DAILY.WEEKLY.toString());
    });

    it('should return the correct frequency for monthly orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId="orbit4" />
        </TestProvider>
      );
      expect(screen.getByTestId('frequency').textContent).toBe(Frequency.LESS_THAN_DAILY.MONTHLY.toString());
    });

    it('should return null for non-existent orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId="non-existent-orbit" />
        </TestProvider>
      );
      expect(screen.getByTestId('frequency').textContent).toBe('');
    });
  });

  describe('nodeWinDataAtom', () => {
    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const [winData] = useAtom(useMemo(() => nodeWinDataAtom(orbitId), [orbitId]));
      return <div data-testid='container'>{JSON.stringify(winData)}</div>;
    };
    it('should return win data for a specific node', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='orbit1' />
        </TestProvider>
      );

      expect(screen.getByText(JSON.stringify(mockAppState.wins.orbit1))).toBeTruthy();
    });

    it('should return empty object for non-existent node win data', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='non-existent-orbit' />
        </TestProvider>
      );

      expect(screen.getByTestId('container').textContent).toBe('{}');
    });
  });

  describe('setWinForNode', () => {
    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const [winData] = useAtom(useMemo(() => nodeWinDataAtom(orbitId), [orbitId]));
      const [, setWin] = useAtom(setWinForNode);
      return (
        <div>
          <div data-testid="container">{JSON.stringify(winData)}</div>
          <button onClick={() => setWin({ nodeId: 'orbit1', date: '2023-05-04', hasWin: true })}>Set Win</button>
        </div>
      );
    };
    it('should set a win for a node', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='orbit1' />
        </TestProvider>
      );

      await userEvent.click(screen.getByText('Set Win'));

      const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
      expect(updatedWinData['2023-05-04']).toBe(true);
    });

    it('should not set a win for a non-existent node', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='non-existent-orbit' />
        </TestProvider>
      );

      await userEvent.click(screen.getByText('Set Win'));

      expect(screen.getByTestId('container').textContent).toBe('{}');
    });
  });

  describe('calculateCompletionStatusAtom', () => {
    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const [completionStatus] = useAtom(useMemo(() => calculateCompletionStatusAtom(orbitId), [orbitId]));
      return <div data-testid="container">{completionStatus}</div>;
    };

    it('should calculate completion status', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='orbit1' />
        </TestProvider>
      );

      // This is a placeholder test. Update it when you implement the actual completion status calculation logic.
      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should return null completion status for non-existent orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='non-existent-orbit'/>
        </TestProvider>
      );

      expect(screen.getByTestId('container').textContent).toBe('');
    });
  });

  describe.skip('calculateStreakAtom', () => {
    it('should calculate streak information', () => {
      const TestComponent = () => {
        const [streak] = useAtom(calculateStreakAtom('orbit1'));
        return <div>{streak}</div>;
      };

      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent />
        </TestProvider>
      );

      // This is a placeholder test. Update it when you implement the actual streak calculation logic.
      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should return null streak for non-existent orbit', () => {
      const TestComponent = () => {
        const [streak] = useAtom(calculateStreakAtom('non-existent-orbit'));
        return <div data-testid="streak">{streak === null ? 'null' : streak}</div>;
      };

      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent />
        </TestProvider>
      );

      expect(screen.getByTestId('streak').textContent).toBe('null');
    });
  });
});