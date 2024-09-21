import React, { act, useMemo } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAtom } from 'jotai';
import { currentSphereAtom, calculateStreakAtom, calculateCompletionStatusAtom, getOrbitFrequency, orbitWinDataAtom, setWinForOrbit } from '../../ui/src/state/selectors';
import mockAppState from '../integration/mocks/mockAppState';
import { TestProvider } from '../utils-frontend';
import { appStateAtom } from '../../ui/src/state/store';
import { Frequency } from '../../ui/src/state/types/orbit';

describe('State selectors', () => {
  describe('currentSphere', () => {
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
      const expectedSphere = JSON.stringify(mockAppState.spheres.byHash[mockAppState.spheres.currentSphereHash].details);
      expect(screen.getByText(expectedSphere)).toBeTruthy();
    });

    it('should return null when the current sphere does not exist', () => {
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

      expect(screen.getByTestId("container").textContent).toBe("null");
    });
  });


  describe('getOrbitFrequency', () => {
    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const [frequency] = useAtom(useMemo(() => getOrbitFrequency(orbitId), [orbitId]));
      return <div data-testid="container">{frequency}</div>;
    };

    it('should return the correct frequency for daily orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId="uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj" />
        </TestProvider>
      );

      expect(screen.getByTestId('container').textContent).toBe(Frequency.DAILY_OR_MORE.DAILY.toString());
    });

    it('should return the correct frequency for weekly orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId="uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc" />
        </TestProvider>
      );
      expect(screen.getByTestId('container').textContent).toBe(Frequency.LESS_THAN_DAILY.WEEKLY.toString());
    });

    it('should return the correct frequency for monthly orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId="uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc" />
        </TestProvider>
      );
      expect(screen.getByTestId('container').textContent).toBe(Frequency.LESS_THAN_DAILY.MONTHLY.toString());
    });

    it('should return null for non-existent orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId="non-existent-orbit" />
        </TestProvider>
      );
      expect(screen.getByTestId('container').textContent).toBe('');
    });
  });


  describe('orbitWinDataAtom', () => {
    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const [winData] = useAtom(useMemo(() => orbitWinDataAtom(orbitId), [orbitId]));
      return <div data-testid='container'>{JSON.stringify(winData)}</div>;
    };
    it('should return win data for a specific orbit', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc' />
        </TestProvider>
      );

      expect(screen.getByText(JSON.stringify(mockAppState.wins.uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc))).toBeTruthy();
    });

    it('should return empty object for non-existent orbit win data', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='non-existent-orbit' />
        </TestProvider>
      );

      expect(screen.getByTestId('container').textContent).toBe('{}');
    });
  });

  describe('setWinForOrbit', () => {
    const TestComponent = ({ orbitId, date, winIndex, hasWin }: { orbitId: string, date: string, winIndex?: number, hasWin: boolean }) => {
      const [winData] = useAtom(useMemo(() => orbitWinDataAtom(orbitId), [orbitId]));
      const [, setWin] = useAtom(setWinForOrbit);
      return (
        <div>
          <div data-testid="container">{JSON.stringify(winData)}</div>
          <button onClick={() => setWin({ orbitHash: orbitId, date, winIndex, hasWin })}>Set Win</button>
        </div>
      );
    };

    it('should set a win for an orbit with frequency == 1', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj' date='2023-05-04' hasWin={true} />
        </TestProvider>
      );

      await userEvent.click(screen.getByText('Set Win'));

      const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
      expect(updatedWinData['2023-05-04']).toBe(true);
    });

    it('should set a win for an orbit with frequency < 1', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc' date='2023-07' hasWin={true} />
        </TestProvider>
      );
      await userEvent.click(screen.getByText('Set Win'));

      const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
      expect(updatedWinData['2023-07']).toBe(true);
    });

    it('should set a win for an orbit with frequency > 1', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc' date='2023-05-04' winIndex={1} hasWin={true} />
        </TestProvider>
      );
      await userEvent.click(screen.getByText('Set Win'));

      const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
      expect(Array.isArray(updatedWinData['2023-05-04'])).toBe(true);
      expect(updatedWinData['2023-05-04'][1]).toBe(true);
    });

    it('should not set a win for a non-existent orbit', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='non-existent-orbit' date='2023-05-04' hasWin={true} />
        </TestProvider>
      );

      await userEvent.click(screen.getByText('Set Win'));

      expect(screen.getByTestId('container').textContent).toBe('{}');
    });
  });

  describe.skip('calculateCompletionStatusAtom', () => {
    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const [completionStatus] = useAtom(useMemo(() => calculateCompletionStatusAtom(orbitId), [orbitId]));
      return <div data-testid="container">{completionStatus}</div>;
    };

    it('should calculate completion status', () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj' />
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
        const [streak] = useAtom(calculateStreakAtom('uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj'));
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