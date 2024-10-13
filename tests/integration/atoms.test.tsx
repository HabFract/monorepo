import React, { act, useMemo } from 'react';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { describe, it, expect, beforeEach, vi, afterEach, beforeAll } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAtom } from 'jotai';

import mockAppState, { mockAppStateSphereNoOrbits, SPHERE_ID } from './mocks/mockAppState';
import { renderWithJotai, TestProvider } from '../utils-frontend';
import { currentSphereDetailsAtom, currentSphereHasCachedNodesAtom, currentSphereHashesAtom, getSphereIdFromEhAtom, sphereHasCachedNodesAtom } from '../../ui/src/state/sphere';
import { resetMocks } from '../setup';
import { addCustomMock, clearCustomMocks, createTestIndexDBAtom, mockedCacheEntries } from '../setupMockStore';

import {
  currentOrbitDetailsAtom, currentOrbitIdAtom, currentSphereOrbitNodesAtom, getOrbitNodeDetailsFromIdAtom, setOrbitWithEntryHashAtom, getOrbitFrequency,
  orbitWinDataAtom, calculateStreakAtom,
  setWinForOrbit,
  getOrbitNodeDetailsFromEhAtom,
  currentSphereOrbitNodeDetailsAtom
} from '../../ui/src/state/orbit';
import { appStateAtom, nodeCache } from '../../ui/src/state/store';
import { Frequency } from '../../ui/src/state/types/orbit';
import { calculateCompletionStatusAtom } from '../../ui/src/state/hierarchy';
import { initialState } from '@ui/src/routes';
import { SphereOrbitNodeDetails } from '../../ui/src/state/types';

describe('Sphere selectors', () => {
  beforeAll(() => {
    resetMocks()
    clearCustomMocks();
    addCustomMock('all', mockedCacheEntries);
  })
  afterEach(() => {
    cleanup();
  });

  describe('AppState - currentSphereHashesAtom', () => {
    it('should return the current sphere hashes when a sphere is selected', () => {
      const TestComponent = () => {
        const [sphereHashes] = useAtom(currentSphereHashesAtom);
        return <div>{JSON.stringify(sphereHashes)}</div>;
      };

      renderWithJotai(<TestComponent />);

      const expectedHashes = JSON.stringify({
        entryHash: mockAppState.spheres.byHash[mockAppState.spheres.currentSphereHash].details.entryHash,
        actionHash: mockAppState.spheres.currentSphereHash,
      });
      expect(screen.getByText(expectedHashes)).toBeTruthy();
    });

    it('should return null when no sphere is selected', () => {
      const modifiedMockState = {
        ...mockAppState,
        spheres: {
          ...mockAppState.spheres,
          currentSphereHash: null,
        },
      };

      const TestComponent = () => {
        const [sphereHashes] = useAtom(currentSphereHashesAtom);
        return <div data-testid="container">{JSON.stringify(sphereHashes)}</div>;
      };

      renderWithJotai(<TestComponent />, { initialState: modifiedMockState as any });

      expect(JSON.parse(screen.getByTestId("container").textContent || "{}")).toBe(null);
    });

    it('should update sphere hashes when set (to invalid hash)', async () => {
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

      renderWithJotai(<TestComponent />);

      const initialHashes = JSON.parse(screen.getByTestId('hashes').textContent || '{}');
      expect(initialHashes.entryHash).toBe(mockAppState.spheres.byHash[mockAppState.spheres.currentSphereHash].details.entryHash);
      expect(initialHashes.actionHash).toBe(mockAppState.spheres.currentSphereHash);

      await act(async () => {
        await userEvent.click(screen.getByText('Update Hashes'));
        // Sets to a hash not in the mocks
      });

      const updatedHashes = JSON.parse(screen.getByTestId('hashes').textContent || '{}');
      // No sphere details to our invalid hash, so returns null
      // May need to test both happy/sad paths with more indepth mocks later
      expect(updatedHashes).toBe(null);
    });
  });

  describe('AppState - currentSphereDetailsAtom', () => {
    it('should return the current sphere when it exists', () => {
      const TestComponent = () => {
        const [currentSphere] = useAtom(currentSphereDetailsAtom);
        return <div>{JSON.stringify(currentSphere)}</div>;
      };
      renderWithJotai(<TestComponent />)

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
        const [currentSphere] = useAtom(currentSphereDetailsAtom);
        return <div data-testid="container">{JSON.stringify(currentSphere)}</div>;
      };

      renderWithJotai(<TestComponent />, { initialState: modifiedMockState })

      expect(screen.getByTestId("container").textContent).toBe("null");
    });
  });

  describe('IndexDB - currentSphereHasCachedNodesAtom', () => {
    it('should return false when no sphere is selected', () => {
      const modifiedMockState = {
        ...mockAppState,
        spheres: {
          ...mockAppState.spheres,
          currentSphereHash: null,
        },
      };

      const TestComponent = () => {
        const [hasCachedNodes] = useAtom(currentSphereHasCachedNodesAtom);
        return <div>{hasCachedNodes?.toString()}</div>;
      };

      renderWithJotai(<TestComponent />, { initialState: modifiedMockState as any });

      expect(screen.getByText('false')).toBeTruthy();
    });

    it('should return the result of sphereHasCachedNodesAtom (true) for the current sphere', () => {
      const TestComponent = () => {
        const [hasCachedNodes] = useAtom(currentSphereHasCachedNodesAtom);
        return <div>{hasCachedNodes?.toString()}</div>;
      };

      renderWithJotai(<TestComponent />);

      // This assumes that the default mockAppState has cached nodes for the current sphere, which is the default Mock state
      expect(screen.getByText('true')).toBeTruthy();
    });

    it('should return null when the current sphere has no hierarchies', () => {
      const modifiedMockState = {
        ...mockAppState,
        spheres: {
          ...mockAppState.spheres,
          byHash: {
            ...mockAppState.spheres.byHash,
            [mockAppState.spheres.currentSphereHash]: {
              ...mockAppState.spheres.byHash[mockAppState.spheres.currentSphereHash],
              hierarchyRootOrbitEntryHashes: [],
            },
          },
        },
      };

      const TestComponent = () => {
        const [hasCachedNodes] = useAtom(currentSphereHasCachedNodesAtom);
        return <div>{hasCachedNodes === null ? 'null' : hasCachedNodes.toString()}</div>;
      };

      renderWithJotai(<TestComponent />, { initialState: modifiedMockState });

      expect(screen.getByText('null')).toBeTruthy();
    });
  });

  describe('IndexDB - sphereHasCachedNodesAtom', () => {
    it('should return true when the sphere has cached nodes', () => {
      const TestComponent = () => {
        const hasCachedNodesAtom = useMemo(() => sphereHasCachedNodesAtom(mockAppState.spheres.currentSphereHash), [mockAppState.spheres.currentSphereHash]);
        const [hasCachedNodes] = useAtom(hasCachedNodesAtom);
        return <div>{hasCachedNodes === null ? 'null' : hasCachedNodes.toString()}</div>;
      };

      renderWithJotai(<TestComponent />)

      expect(screen.getByText('true')).toBeTruthy();
    });

    it('should return null when the sphere hash is not in the cache', () => {
      const TestComponent = () => {
        const hasCachedNodesAtom = useMemo(() => sphereHasCachedNodesAtom('false-hash'), []);
        const [hasCachedNodes] = useAtom(hasCachedNodesAtom);
        return <div>{`${hasCachedNodes}`}</div>;
      };

      renderWithJotai(<TestComponent />)

      expect(screen.getByText('null')).toBeTruthy();
    });

    it('should return null when the sphere hash is valid but has no cached nodes', async () => {
      clearCustomMocks();
      addCustomMock('all', [[SPHERE_ID, {} as any]]);

      const TestComponent = () => {
        const hasCachedNodesAtom = useMemo(() => sphereHasCachedNodesAtom(mockAppState.spheres.currentSphereHash), [mockAppState.spheres.currentSphereHash]);
        const [hasCachedNodes] = useAtom(hasCachedNodesAtom);
        return <div>{hasCachedNodes === null ? 'null' : hasCachedNodes.toString()}</div>;
      };
      await renderWithJotai(<TestComponent />, { initialState: mockAppStateSphereNoOrbits })

      expect(screen.getByText('null')).toBeTruthy();
    });
  });

  describe('AppState - getSphereIdFromEhAtom', () => {
    const mockAppStateWithSpheres = {
      ...mockAppState,
      spheres: {
        byHash: {
          'sphere1': { details: { entryHash: 'sphereEH1' } },
          'sphere2': { details: { entryHash: 'sphereEH2' } },
          'sphere3': { details: { entryHash: 'sphereEH3' } },
        },
        currentSphereHash: 'sphere1',
      },
    };

    const TestComponent = ({ sphereEh }: { sphereEh: string }) => {
      const sphereIdAtom = useMemo(() => getSphereIdFromEhAtom(sphereEh), [sphereEh]);
      const [sphereId] = useAtom(sphereIdAtom);
      return <div data-testid="sphereId">{sphereId || 'null'}</div>;
    };

    it('should return the correct sphere id when the sphere exists', () => {
      renderWithJotai(<TestComponent sphereEh="sphereEH2" />, { initialState: mockAppStateWithSpheres as any });

      expect(screen.getByTestId('sphereId').textContent).toBe('sphere2');
    });

    it('should return null when the sphere does not exist', () => {
      renderWithJotai(<TestComponent sphereEh="nonExistentSphereEH" />, { initialState: mockAppStateWithSpheres as any });

      expect(screen.getByTestId('sphereId').textContent).toBe('null');
    });

    it('should return null when the spheres object is empty', () => {
      const emptySpheresState = {
        ...mockAppStateWithSpheres,
        spheres: {
          byHash: {},
          currentSphereHash: '',
        },
      };

      renderWithJotai(<TestComponent sphereEh="sphereEH1" />, { initialState: emptySpheresState });

      expect(screen.getByTestId('sphereId').textContent).toBe('null');
    });

    it('should return the correct sphere id when multiple spheres exist', () => {
      renderWithJotai(<TestComponent sphereEh="sphereEH3" />, { initialState: mockAppStateWithSpheres as any });

      expect(screen.getByTestId('sphereId').textContent).toBe('sphere3');
    });
  });

  describe('AppState - sphereHasCachedNodesAtom', () => {
    it('should return null when there are no hierarchies for the sphere', () => {
      const modifiedMockState = {
        ...mockAppState,
        spheres: {
          ...mockAppState.spheres,
          byHash: {
            ...mockAppState.spheres.byHash,
            [mockAppState.spheres.currentSphereHash]: {
              ...mockAppState.spheres.byHash[mockAppState.spheres.currentSphereHash],
              hierarchyRootOrbitEntryHashes: [],
            },
          },
        },
      };

      const TestComponent = () => {
        const sphereId = mockAppState.spheres.currentSphereHash;
        const sphereHasCachedNodesAtomMemo = useMemo(() => sphereHasCachedNodesAtom(sphereId), [sphereId])
        const [hasCachedNodes] = useAtom(sphereHasCachedNodesAtomMemo);
        return <div>{hasCachedNodes === null ? 'null' : hasCachedNodes.toString()}</div>;
      };

      renderWithJotai(<TestComponent />, { initialState: modifiedMockState as any });

      expect(screen.getByText('null')).toBeTruthy();
    });
  });
});

describe('Orbit selectors', () => {
  beforeEach(() => {
    resetMocks()
    clearCustomMocks();
    addCustomMock('all', mockedCacheEntries);
    // By default assume a populated node cache, keyed by entry hash
  })
  afterEach(() => {
    cleanup();
  });

  describe('IndexDB - getOrbitNodeDetailsFromEhAtom', () => {
    const TestComponent = ({ orbitEh }: { orbitEh: string }) => {
      const orbitDetailsAtom = useMemo(() => getOrbitNodeDetailsFromEhAtom(orbitEh), [orbitEh]);
      const [orbitDetails] = useAtom(orbitDetailsAtom);
      return <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>;
    };

    it('should return orbit details when the orbit exists', () => {
      renderWithJotai(<TestComponent orbitEh="uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj" />);

      const orbitDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || 'null');
      expect(orbitDetails).not.toBeNull();
      expect(orbitDetails.id).toBe('uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj');
      expect(orbitDetails.eH).toBe('uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj');
      expect(orbitDetails.name).toBe('Be the best');
    });

    it('should return null when the orbit does not exist', () => {
      renderWithJotai(<TestComponent orbitEh="nonExistentOrbitEH" />);

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');
    });

    it('should return null when nodeCache is empty', () => {
      clearCustomMocks();
      addCustomMock('all', []);

      renderWithJotai(<TestComponent orbitEh="orbit1EH" />);

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');
    });
  });

  describe('IndexDB - currentOrbitDetailsAtom', () => {
    const TestComponent = () => {
      const [orbitDetails] = useAtom(currentOrbitDetailsAtom);
      return <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>;
    };

    it('should return null when no orbit is selected', () => {
      const modifiedMockState = {
        ...mockAppState,
        orbitNodes: {
          ...mockAppState.orbitNodes,
          currentOrbitHash: null,
        },
      };
      renderWithJotai(<TestComponent />, { initialState: modifiedMockState });

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');
    });

    it('should return the details of the selected orbit', async () => {
      renderWithJotai(<TestComponent />);

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

      renderWithJotai(<WrappedTestComponent />);

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

      renderWithJotai(<WrappedTestComponent />, { initialState: modifiedMockState });

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

  describe('IndexDB - currentSphereOrbitNodeDetailsAtom', () => {
    beforeEach(() => {
      resetMocks()
      clearCustomMocks();
      addCustomMock('all', mockedCacheEntries);
    })
    afterEach(() => {
      cleanup();
    });

    const TestComponent = () => {
      const [sphereOrbitNodeDetails] = useAtom(currentSphereOrbitNodeDetailsAtom);
      return <div data-testid="sphereOrbitNodeDetails">{JSON.stringify(sphereOrbitNodeDetails)}</div>;
    };

    it('should return null when no sphere is selected', () => {
      const modifiedMockState = {
        ...mockAppState,
        spheres: {
          ...mockAppState.spheres,
          currentSphereHash: null,
        },
      };

      renderWithJotai(<TestComponent />, { initialState: modifiedMockState as any });

      expect(screen.getByTestId('sphereOrbitNodeDetails').textContent).toBe('null');
    });

    it('should return SphereOrbitNodeDetails when a sphere is selected', () => {
      renderWithJotai(<TestComponent />);

      const sphereOrbitNodeDetails = JSON.parse(screen.getByTestId('sphereOrbitNodeDetails').textContent || 'null');
      expect(sphereOrbitNodeDetails).not.toBeNull();
      expect(Object.keys(sphereOrbitNodeDetails).length).toBeGreaterThan(0);
      expect(sphereOrbitNodeDetails['uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj']).toBeDefined();
    });

    it('should return null when the selected sphere has no orbit node details', () => {
      clearCustomMocks();
      addCustomMock('partial', [[mockAppState.spheres.currentSphereHash, null as any]]);

      renderWithJotai(<TestComponent />);

      expect(screen.getByTestId('sphereOrbitNodeDetails').textContent).toBe('null');
    });

    it('should update when the current sphere changes', async () => {
      const TestComponentWithSphereChange = () => {
        const [, setCurrentSphereHashes] = useAtom(currentSphereHashesAtom);
        const [sphereOrbitNodeDetails] = useAtom(currentSphereOrbitNodeDetailsAtom);

        return (
          <div>
            <div data-testid="sphereOrbitNodeDetails">{JSON.stringify(sphereOrbitNodeDetails)}</div>
            <button onClick={() => setCurrentSphereHashes({ actionHash: 'sphere2Id' })}>
              Change Sphere
            </button>
          </div>
        );
      };
      const modifiedMockState = {
        ...mockAppState,
        spheres: {
          currentSphereHash: 'sphere2Id',
          byHash: {
            ...mockAppState.spheres.byHash,
            sphere2: { details: { entryHash: 'sphere2EH' } },
          },
        },
      };
      clearCustomMocks();
      addCustomMock('partial', [
        ['sphere2Id', { 'orbit3EH': { id: 'orbit3', eH: 'orbit3EH', name: 'Orbit 3', sphereHash: 'sphere2' } }],
      ]);

      renderWithJotai(<TestComponentWithSphereChange />, { initialState: modifiedMockState as any });

      const initialSphereOrbitNodeDetails = JSON.parse(screen.getByTestId('sphereOrbitNodeDetails').textContent || 'null');
      expect(initialSphereOrbitNodeDetails).not.toBeNull();
      expect(Object.keys(initialSphereOrbitNodeDetails).length).toBeGreaterThan(0);

      await act(async () => {
        await userEvent.click(screen.getByText('Change Sphere'));
      });

      const updatedSphereOrbitNodeDetails = JSON.parse(screen.getByTestId('sphereOrbitNodeDetails').textContent || 'null');
      expect(updatedSphereOrbitNodeDetails).not.toBeNull();
      expect(Object.keys(updatedSphereOrbitNodeDetails).length).toBe(1);
      expect(updatedSphereOrbitNodeDetails['orbit3EH']).toBeDefined();
    });
  });

  describe('AppState - currentSphereOrbitNodesAtom', () => {
    it('should return orbit nodes for the current sphere', () => {
      const TestComponent = () => {
        const [sphereNodes] = useAtom(currentSphereOrbitNodesAtom);
        return <div>{JSON.stringify(sphereNodes)}</div>;
      };

      renderWithJotai(<TestComponent />);

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

      renderWithJotai(<TestComponent />, { initialState: modifiedMockState });

      expect(screen.getByTestId("container").textContent).toBe("null");
    });
  });

  describe('IndexDB - getOrbitNodeDetailsFromIdAtom', () => {
    // For convenience we will target this mock, copied from mocked cache
    const targetedOrbitId = mockAppState.orbitNodes.currentOrbitHash!;
    const targetedOrbitEh = "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc";
    const firstOrbitDetails = { ...Object.fromEntries(mockedCacheEntries)[SPHERE_ID][targetedOrbitEh] };

    const TestComponent = ({ orbitId }: { orbitId: string }) => {
      const orbitDetailsAtom = useMemo(() => getOrbitNodeDetailsFromIdAtom(orbitId), [orbitId]);
      const [orbitDetails] = useAtom(orbitDetailsAtom);
      return <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>;
    };

    it('should return orbit details when the orbit exists', () => {
      renderWithJotai(<TestComponent orbitId={targetedOrbitId} />);

      const orbitDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || 'null');
      expect(orbitDetails).not.toBeNull();
      expect(orbitDetails.id).toBe(firstOrbitDetails.id);
      expect(orbitDetails.name).toBe(firstOrbitDetails.name);
    });

    it('should return null when the orbit does not exist', () => {
      renderWithJotai(<TestComponent orbitId="nonExistentOrbit" />);

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');
    });

    it('should return null when the orbit exists in appState but not in nodeCache', () => {
      clearCustomMocks();
      addCustomMock('all', []);

      renderWithJotai(<TestComponent orbitId="orbit1" />);

      expect(screen.getByTestId('orbitDetails').textContent).toBe('null');
    });
  });


  // describe('setOrbitWithEntryHashAtom', () => {
  //   let testOrbitActionHash: ActionHashB64;
  //   let testOrbitEntryHash: EntryHashB64;

  //   beforeEach(() => {
  //     const orbitEntry = Object.entries(mockAppState.orbitNodes.byHash)[0];
  //     testOrbitActionHash = orbitEntry[0];
  //     testOrbitEntryHash = orbitEntry[1].eH;
  //   });

  //   const TestComponent = () => {
  //     const [, setOrbitAtom] = useAtom(setOrbitWithEntryHashAtom);
  //     const orbitAtom = useMemo(() => getOrbitNodeDetailsFromIdAtom(testOrbitActionHash), [testOrbitActionHash]);
  //     const [orbitDetails] = useAtom(orbitAtom);

  //     const updateOrbit = () => {
  //       setOrbitAtom({
  //         orbitEh: testOrbitEntryHash,
  //         update: { name: 'Updated Orbit Name' }
  //       });
  //     };

  //     return (
  //       <div>
  //         <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>
  //         <button onClick={updateOrbit}>Update Orbit</button>
  //       </div>
  //     );
  //   };

  //   it('should update orbit details when the orbit exists', async () => {
  //     await act(async () => {
  //       render(
  //         <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //           <TestComponent />
  //         </TestProvider>
  //       );
  //     });

  //     const initialDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || '{}');
  //     expect(initialDetails.name).not.toBe('Updated Orbit Name');

  //     await act(async () => {
  //       fireEvent.click(screen.getByText('Update Orbit'));
  //     });

  //     const updatedDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || '{}');
  //     expect(updatedDetails.name).toBe('Updated Orbit Name');
  //   });

  //   it('should not update orbit details when the orbit is not found', async () => {
  //     const TestComponentWithNonExistentOrbit = () => {
  //       const [, setOrbitAtom] = useAtom(setOrbitWithEntryHashAtom);
  //       const orbitAtom = useMemo(() => getOrbitNodeDetailsFromIdAtom(testOrbitActionHash), [testOrbitActionHash]);
  //       const [orbitDetails] = useAtom(orbitAtom);

  //       const updateOrbit = () => {
  //         setOrbitAtom({
  //           orbitEh: 'nonExistentOrbitEh',
  //           update: { name: 'Updated Orbit Name' }
  //         });
  //       };

  //       return (
  //         <div>
  //           <div data-testid="orbitDetails">{JSON.stringify(orbitDetails)}</div>
  //           <button onClick={updateOrbit}>Update Orbit</button>
  //         </div>
  //       );
  //     };

  //     await act(async () => {
  //       render(
  //         <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //           <TestComponentWithNonExistentOrbit />
  //         </TestProvider>
  //       );
  //     });

  //     const initialDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || '{}');

  //     await act(async () => {
  //       fireEvent.click(screen.getByText('Update Orbit'));
  //     });

  //     const updatedDetails = JSON.parse(screen.getByTestId('orbitDetails').textContent || '{}');
  //     expect(updatedDetails).toEqual(initialDetails);
  //   });
  // });

  // describe('getOrbitFrequency', () => {
  //   const TestComponent = ({ orbitId }: { orbitId: string }) => {
  //     const [frequency] = useAtom(useMemo(() => getOrbitFrequency(orbitId), [orbitId]));
  //     return <div data-testid="container">{frequency}</div>;
  //   };

  //   it('should return the correct frequency for daily orbit', () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId="uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj" />
  //       </TestProvider>
  //     );

  //     expect(screen.getByTestId('container').textContent).toBe(Frequency.DAILY_OR_MORE.DAILY.toString());
  //   });

  //   it('should return the correct frequency for weekly orbit', () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId="uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc" />
  //       </TestProvider>
  //     );
  //     expect(screen.getByTestId('container').textContent).toBe(Frequency.LESS_THAN_DAILY.WEEKLY.toString());
  //   });

  //   it('should return the correct frequency for monthly orbit', () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId="uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc" />
  //       </TestProvider>
  //     );
  //     expect(screen.getByTestId('container').textContent).toBe(Frequency.LESS_THAN_DAILY.MONTHLY.toString());
  //   });

  //   it('should return null for non-existent orbit', () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId="non-existent-orbit" />
  //       </TestProvider>
  //     );
  //     expect(screen.getByTestId('container').textContent).toBe('');
  //   });
  // });

  // describe('orbitWinDataAtom', () => {
  //   const TestComponent = ({ orbitId }: { orbitId: string }) => {
  //     const [winData] = useAtom(useMemo(() => orbitWinDataAtom(orbitId), [orbitId]));
  //     return <div data-testid='container'>{JSON.stringify(winData)}</div>;
  //   };
  //   it('should return win data for a specific orbit', () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId='uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc' />
  //       </TestProvider>
  //     );

  //     expect(screen.getByText(JSON.stringify(mockAppState.wins.uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc))).toBeTruthy();
  //   });

  //   it('should return empty object for non-existent orbit win data', () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId='non-existent-orbit' />
  //       </TestProvider>
  //     );

  //     expect(screen.getByTestId('container').textContent).toBe('{}');
  //   });
  // });

  // describe('setWinForOrbit', () => {
  //   const TestComponent = ({ orbitId, date, winIndex, hasWin }: { orbitId: string, date: string, winIndex?: number, hasWin: boolean }) => {
  //     const [winData] = useAtom(useMemo(() => orbitWinDataAtom(orbitId), [orbitId]));
  //     const [, setWin] = useAtom(setWinForOrbit);
  //     return (
  //       <div>
  //         <div data-testid="container">{JSON.stringify(winData)}</div>
  //         <button onClick={() => setWin({ orbitHash: orbitId, date, winIndex, hasWin })}>Set Win</button>
  //       </div>
  //     );
  //   };

  //   it('should set a win for an orbit with frequency == 1', async () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId='uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj' date='2023-05-04' hasWin={true} />
  //       </TestProvider>
  //     );

  //     await act(async () => {
  //       await userEvent.click(screen.getByText('Set Win'));
  //     });

  //     const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
  //     expect(updatedWinData['2023-05-04']).toBe(true);
  //   });

  //   it('should set a win for an orbit with frequency < 1', async () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId='uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc' date='2023-07' hasWin={true} />
  //       </TestProvider>
  //     );

  //     await act(async () => {
  //       await userEvent.click(screen.getByText('Set Win'));
  //     })

  //     const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
  //     expect(updatedWinData['2023-07']).toBe(true);
  //   });

  //   it('should set a win for an orbit with frequency > 1', async () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId='uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc' date='2023-05-04' winIndex={1} hasWin={true} />
  //       </TestProvider>
  //     );

  //     await act(async () => {
  //       await userEvent.click(screen.getByText('Set Win'));
  //     })

  //     const updatedWinData = JSON.parse(screen.getByTestId('container').textContent || '{}');
  //     expect(Array.isArray(updatedWinData['2023-05-04'])).toBe(true);
  //     expect(updatedWinData['2023-05-04'][1]).toBe(true);
  //   });

  //   it('should not set a win for a non-existent orbit', async () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId='non-existent-orbit' date='2023-05-04' hasWin={true} />
  //       </TestProvider>
  //     );

  //     await act(async () => {
  //       await userEvent.click(screen.getByText('Set Win'));
  //     })

  //     expect(screen.getByTestId('container').textContent).toBe('{}');
  //   });
  // });

  // describe('calculateCompletionStatusAtom', () => {
  //   const TestComponent = ({ orbitId }: { orbitId: string }) => {
  //     const [completionStatus] = useAtom(useMemo(() => calculateCompletionStatusAtom(orbitId), [orbitId]));
  //     return <div data-testid="container">{completionStatus}</div>;
  //   };

  //   it('should calculate completion status', () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId='uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj' />
  //       </TestProvider>
  //     );

  //     // This is a placeholder test. Update it when you implement the actual completion status calculation logic.
  //     expect(screen.getByText('0')).toBeTruthy();
  //   });

  //   it('should return null completion status for non-existent orbit', () => {
  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent orbitId='non-existent-orbit' />
  //       </TestProvider>
  //     );

  //     expect(screen.getByTestId('container').textContent).toBe('');
  //   });
  // });

  // describe('calculateStreakAtom', () => {
  //   it('should calculate streak information', () => {
  //     const TestComponent = () => {
  //       const [streak] = useAtom(calculateStreakAtom('uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj'));
  //       return <div>{streak}</div>;
  //     };

  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent />
  //       </TestProvider>
  //     );

  //     // This is a placeholder test. Update it when you implement the actual streak calculation logic.
  //     expect(screen.getByText('0')).toBeTruthy();
  //   });

  //   it('should return null streak for non-existent orbit', () => {
  //     const TestComponent = () => {
  //       const [streak] = useAtom(calculateStreakAtom('non-existent-orbit'));
  //       return <div data-testid="streak">{streak === null ? 'null' : streak}</div>;
  //     };

  //     render(
  //       <TestProvider initialValues={[[appStateAtom, mockAppState]]}>
  //         <TestComponent />
  //       </TestProvider>
  //     );

  //     expect(screen.getByTestId('streak').textContent).toBe('null');
  //   });
  // });
});