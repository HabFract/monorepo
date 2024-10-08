import React, { act, useMemo } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAtom } from 'jotai';
import mockAppState from './mocks/mockAppState';
import { TestProvider } from '../utils-frontend';
import { appStateAtom } from '../../ui/src/state/store';
import { Frequency } from '../../ui/src/state/types/orbit';
import { currentSphereAtom, currentSphereHasCachedNodesAtom, currentSphereHashesAtom, sphereHasCachedNodesAtom } from '../../ui/src/state/sphere';
import {
  currentOrbitDetailsAtom, currentOrbitIdAtom, currentSphereOrbitNodesAtom, getOrbitAtom, setOrbitWithEntryHashAtom, getOrbitFrequency,
  orbitWinDataAtom, calculateStreakAtom,
  setWinForOrbit
} from '../../ui/src/state/orbit';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { calculateCompletionStatusAtom } from '../../ui/src/state/hierarchy';

describe('Sphere selectors', () => {
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

  describe('sphereHasCachedNodesAtom', () => {
    it.only('should return true when the sphere has cached nodes', () => {
      const TestComponent = () => {
        const hasCachedNodesAtom = useMemo(() => sphereHasCachedNodesAtom(mockAppState.spheres.currentSphereHash), [mockAppState.spheres.currentSphereHash]);
        const [hasCachedNodes] = useAtom(hasCachedNodesAtom);
        return <div>{hasCachedNodes?.toString()}</div>;
      };

      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent />
        </TestProvider>
      );

      expect(screen.getByText('true')).toBeTruthy();
    });

    // it('should return false when the sphere has no cached nodes', () => {
    //   vi.mocked(nodeCache.item).mockReturnValue({
    //     init: vi.fn().mockReturnValue({}),
    //   });

    //   const TestComponent = () => {
    //     const [hasCachedNodes] = useAtom(sphereHasCachedNodesAtom(mockAppState.spheres.currentSphereHash));
    //     return <div>{hasCachedNodes.toString()}</div>;
    //   };

    //   render(
    //     <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
    //       <TestComponent />
    //     </TestProvider>
    //   );

    //   expect(screen.getByText('false')).toBeTruthy();
    // });

    // it('should return null when there are no hierarchies for the sphere', () => {
    //   const modifiedMockState = {
    //     ...mockAppState,
    //     spheres: {
    //       ...mockAppState.spheres,
    //       byHash: {
    //         ...mockAppState.spheres.byHash,
    //         [mockAppState.spheres.currentSphereHash]: {
    //           ...mockAppState.spheres.byHash[mockAppState.spheres.currentSphereHash],
    //           hierarchyRootOrbitEntryHashes: [],
    //         },
    //       },
    //     },
    //   };

    const TestComponent = () => {
      const [hasCachedNodes] = useAtom(sphereHasCachedNodesAtom(mockAppState.spheres.currentSphereHash));
      return <div>{hasCachedNodes === null ? 'null' : hasCachedNodes.toString()}</div>;
    };

    render(
      <TestProvider initialValues={[[appStateAtom, modifiedMockState]]}>
        <TestComponent />
      </TestProvider>
    );

    expect(screen.getByText('null')).toBeTruthy();
  });
});

describe('currentSphereHashesAtom', () => {
  it('should return the current sphere hashes when a sphere is selected', () => {
    const TestComponent = () => {
      const [sphereHashes] = useAtom(currentSphereHashesAtom);
      return <div>{JSON.stringify(sphereHashes)}</div>;
    };

    render(
      <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
        <TestComponent />
      </TestProvider>
    );

    const expectedHashes = JSON.stringify({
      entryHash: mockAppState.spheres.byHash[mockAppState.spheres.currentSphereHash].details.entryHash,
      actionHash: mockAppState.spheres.currentSphereHash,
    });
    expect(screen.getByText(expectedHashes)).toBeTruthy();
  });

  it('should return an empty object when no sphere is selected', () => {
    const modifiedMockState = {
      ...mockAppState,
      spheres: {
        ...mockAppState.spheres,
        currentSphereHash: '',
      },
    };

    const TestComponent = () => {
      const [sphereHashes] = useAtom(currentSphereHashesAtom);
      return <div data-testid="container">{JSON.stringify(sphereHashes)}</div>;
    };

    render(
      <TestProvider initialValues={[[appStateAtom, modifiedMockState]]}>
        <TestComponent />
      </TestProvider>
    );

    expect(screen.getByTestId("container").textContent).toBe("{}");
  });

  it.skip('should update sphere hashes when set', async () => {
    const TestComponent = () => {
      const [sphereHashes, setSphereHashes] = useAtom(currentSphereHashesAtom);

      return (
        <div>
          <div data-testid="hashes">{JSON.stringify(sphereHashes)}</div>
          <button onClick={() => {
            setSphereHashes({
              entryHash: 'newEntryHash',
              actionHash: 'newActionHash'
            });
          }}>Update Hashes</button>
        </div>
      );
    };

    render(
      <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
        <TestComponent />
      </TestProvider>
    );

    const initialHashes = JSON.parse(screen.getByTestId('hashes').textContent || '{}');
    expect(initialHashes.entryHash).toBe(mockAppState.spheres.byHash[mockAppState.spheres.currentSphereHash].details.entryHash);
    expect(initialHashes.actionHash).toBe(mockAppState.spheres.currentSphereHash);

    await act(async () => {
      await userEvent.click(screen.getByText('Update Hashes'));
    });

    const updatedHashes = JSON.parse(screen.getByTestId('hashes').textContent || '{}');
    expect(updatedHashes.entryHash).toBe('newEntryHash');
    expect(updatedHashes.actionHash).toBe('newActionHash');

  });
});
});

describe('Orbit selectors', () => {
  describe('currentOrbitDetailsAtom', () => {
    const TestComponent = () => {
      const [orbitDetails] = useAtom(currentOrbitDetailsAtom);
      return <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>;
    };

    it('should return null when no orbit is selected', () => {
      const modifiedMockState = {
        ...mockAppState,
        orbitNodes: {
          ...mockAppState.orbitNodes,
          currentOrbitHash: '',
        },
      };
      render(
        <TestProvider initialValues={[[appStateAtom, modifiedMockState]]}>
          <TestComponent />
        </TestProvider>
      );

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');
    });

    it('should return the details of the selected orbit', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent />
        </TestProvider>
      );

      const orbitDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || 'null');
      expect(orbitDetails).not.toBe(null);
      expect(orbitDetails.id).toBe(mockAppState.orbitNodes.currentOrbitHash);
      expect(orbitDetails.name).toBe('Daily Exercise');
    });

    it('should return null for a non-existent orbit', async () => {
      const WrappedTestComponent = () => {
        const [, setCurrentOrbitId] = useAtom(currentOrbitIdAtom);

        React.useEffect(() => {
          setCurrentOrbitId('non-existent-orbit');
        }, []);

        return <TestComponent />;
      };

      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <WrappedTestComponent />
        </TestProvider>
      );

      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');
    });

    it('should update when the current orbit changes', async () => {
      const modifiedMockState = {
        ...mockAppState,
        orbitNodes: {
          ...mockAppState.orbitNodes,
          currentOrbitHash: '',
        },
      };
      const WrappedTestComponent = () => {
        const [, setCurrentOrbitId] = useAtom(currentOrbitIdAtom);

        return (
          <>
            <TestComponent />
            <button onClick={() => setCurrentOrbitId('uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc')}>
              Change Orbit
            </button>
          </>
        );
      };

      render(
        <TestProvider initialValues={[[appStateAtom, modifiedMockState]]}>
          <WrappedTestComponent />
        </TestProvider>
      );

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');

      await act(async () => {
        await userEvent.click(screen.getByText('Change Orbit'));
      });

      const orbitDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || 'null');
      expect(orbitDetails).not.toBe(null);
      expect(orbitDetails.id).toBe('uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc');
      expect(orbitDetails.name).toBe('Weekly Gym Session');
    });
  });

  describe('currentSphereOrbitNodesAtom', () => {
    it('should return orbit nodes for the current sphere', () => {
      const TestComponent = () => {
        const [sphereNodes] = useAtom(currentSphereOrbitNodesAtom);
        return <div>{JSON.stringify(sphereNodes)}</div>;
      };

      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent />
        </TestProvider>
      );

      const expectedNodes = JSON.stringify(mockAppState.orbitNodes.byHash);
      expect(screen.getByText(expectedNodes)).toBeTruthy();
    });

    it('should return null when there are no orbit nodes', () => {
      const modifiedMockState = {
        ...mockAppState,
        orbitNodes: {
          ...mockAppState.orbitNodes,
          byHash: {},
        },
      };

      const TestComponent = () => {
        const [sphereNodes] = useAtom(currentSphereOrbitNodesAtom);
        return <div data-testid="container">{JSON.stringify(sphereNodes)}</div>;
      };

      render(
        <TestProvider initialValues={[[appStateAtom, modifiedMockState]]}>
          <TestComponent />
        </TestProvider>
      );

      expect(screen.getByTestId("container").textContent).toBe("null");
    });
  });

  describe('getOrbitAtom', () => {
    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const orbitAtom = useMemo(() => getOrbitAtom(orbitId), [orbitId]);
      const [orbitDetails] = useAtom(orbitAtom);
      return <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>;
    };

    it('should return null when the orbit is not found', async () => {
      await act(async () => {
        render(
          <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
            <TestComponent orbitId="nonExistentOrbitId" />
          </TestProvider>
        );
      });

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');
    });

    it('should return the correct orbit details when found', async () => {
      const testOrbitId = Object.keys(mockAppState.orbitNodes.byHash)[0]; // Assuming this is a valid orbit ID in the mock state

      await act(async () => {
        render(
          <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
            <TestComponent orbitId={testOrbitId} />
          </TestProvider>
        );
      });

      const orbitDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || 'null');
      expect(orbitDetails).not.toBe(null);
      expect(orbitDetails.id).toBe(testOrbitId);
      expect(orbitDetails.name).toBe(mockAppState.orbitNodes.byHash[testOrbitId].name);
    });

    it('should update when the orbit details change', async () => {
      const testOrbitId = Object.keys(mockAppState.orbitNodes.byHash)[0];

      const TestComponentWithOrbitChange = () => {
        const [appState, setAppState] = useAtom(appStateAtom);
        const orbitAtom = useMemo(() => getOrbitAtom(testOrbitId), [testOrbitId]);
        const [orbitDetails] = useAtom(orbitAtom);

        const changeOrbitName = () => {
          setAppState(prev => ({
            ...prev,
            orbitNodes: {
              ...prev.orbitNodes,
              byHash: {
                ...prev.orbitNodes.byHash,
                [testOrbitId]: {
                  ...prev.orbitNodes.byHash[testOrbitId],
                  name: 'Updated Orbit Name'
                }
              }
            }
          }));
        };

        return (
          <div>
            <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>
            <button onClick={changeOrbitName}>Change Orbit Name</button>
          </div>
        );
      };

      await act(async () => {
        render(
          <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
            <TestComponentWithOrbitChange />
          </TestProvider>
        );
      });

      const initialOrbitDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || 'null');
      expect(initialOrbitDetails.name).not.toBe('Updated Orbit Name');

      await act(async () => {
        screen.getByText('Change Orbit Name').click();
      });

      const updatedOrbitDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || 'null');
      expect(updatedOrbitDetails.name).toBe('Updated Orbit Name');
    });
  });

  describe('setOrbitWithEntryHashAtom', () => {
    let testOrbitActionHash: ActionHashB64;
    let testOrbitEntryHash: EntryHashB64;

    beforeEach(() => {
      const orbitEntry = Object.entries(mockAppState.orbitNodes.byHash)[0];
      testOrbitActionHash = orbitEntry[0];
      testOrbitEntryHash = orbitEntry[1].eH;
    });

    const TestComponent = () => {
      const [, setOrbitAtom] = useAtom(setOrbitWithEntryHashAtom);
      const orbitAtom = useMemo(() => getOrbitAtom(testOrbitActionHash), [testOrbitActionHash]);
      const [orbitDetails] = useAtom(orbitAtom);

      const updateOrbit = () => {
        setOrbitAtom({
          orbitEh: testOrbitEntryHash,
          update: { name: 'Updated Orbit Name' }
        });
      };

      return (
        <div>
          <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>
          <button onClick={updateOrbit}>Update Orbit</button>
        </div>
      );
    };

    it('should update orbit details when the orbit exists', async () => {
      await act(async () => {
        render(
          <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
            <TestComponent />
          </TestProvider>
        );
      });

      const initialDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || '{}');
      expect(initialDetails.name).not.toBe('Updated Orbit Name');

      await act(async () => {
        fireEvent.click(screen.getByText('Update Orbit'));
      });

      const updatedDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || '{}');
      expect(updatedDetails.name).toBe('Updated Orbit Name');
    });

    it('should not update orbit details when the orbit is not found', async () => {
      const TestComponentWithNonExistentOrbit = () => {
        const [, setOrbitAtom] = useAtom(setOrbitWithEntryHashAtom);
        const orbitAtom = useMemo(() => getOrbitAtom(testOrbitActionHash), [testOrbitActionHash]);
        const [orbitDetails] = useAtom(orbitAtom);

        const updateOrbit = () => {
          setOrbitAtom({
            orbitEh: 'nonExistentOrbitEh',
            update: { name: 'Updated Orbit Name' }
          });
        };

        return (
          <div>
            <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>
            <button onClick={updateOrbit}>Update Orbit</button>
          </div>
        );
      };

      await act(async () => {
        render(
          <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
            <TestComponentWithNonExistentOrbit />
          </TestProvider>
        );
      });

      const initialDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || '{}');

      await act(async () => {
        fireEvent.click(screen.getByText('Update Orbit'));
      });

      const updatedDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || '{}');
      expect(updatedDetails).toEqual(initialDetails);
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

      await act(async () => {
        await userEvent.click(screen.getByText('Set Win'));
      });

      const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
      expect(updatedWinData['2023-05-04']).toBe(true);
    });

    it('should set a win for an orbit with frequency < 1', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc' date='2023-07' hasWin={true} />
        </TestProvider>
      );

      await act(async () => {
        await userEvent.click(screen.getByText('Set Win'));
      })

      const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
      expect(updatedWinData['2023-07']).toBe(true);
    });

    it('should set a win for an orbit with frequency > 1', async () => {
      render(
        <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
          <TestComponent orbitId='uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc' date='2023-05-04' winIndex={1} hasWin={true} />
        </TestProvider>
      );

      await act(async () => {
        await userEvent.click(screen.getByText('Set Win'));
      })

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

      await act(async () => {
        await userEvent.click(screen.getByText('Set Win'));
      })

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
          <TestComponent orbitId='non-existent-orbit' />
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