import React, { act, useMemo } from 'react';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { describe, it, expect, beforeEach, vi, afterEach, beforeAll } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAtom } from 'jotai';

import mockAppState, { mockAppStateSphereNoOrbits, SPHERE_ID } from './mocks/mockAppState';
import { renderWithJotai } from '../utils-frontend';
import { currentSphereDetailsAtom, currentSphereHasCachedNodesAtom, currentSphereHashesAtom, getSphereIdFromEhAtom, sphereHasCachedNodesAtom } from '../../ui/src/state/sphere';
import { resetMocks } from '../setup';
import { addCustomMock, clearCustomMocks, mockedCacheEntries } from '../setupMockStore';

import {
  currentOrbitDetailsAtom, currentOrbitIdAtom, currentSphereOrbitNodesAtom, getOrbitNodeDetailsFromIdAtom, setOrbitWithEntryHashAtom, getOrbitFrequency,
  getOrbitNodeDetailsFromEhAtom,
  currentSphereOrbitNodeDetailsAtom,
  getCurrentSphereOrbitNodeDetailsFromEhAtom,
  getCurrentOrbitStartTimeFromEh,
  getOrbitIdFromEh,
  getOrbitEhFromId,
  orbitWinDataAtom
} from '../../ui/src/state/orbit';

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

    it('should update sphere hashes when set', async () => {
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
      });

      const updatedHashes = JSON.parse(screen.getByTestId('hashes').textContent || '{}');
      expect(updatedHashes.entryHash).toBe('newEntryHash');
      expect(updatedHashes.actionHash).toBe('newActionHash');
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

  describe('AppState - currentOrbitIdAtom', () => {
    const TestComponent = () => {
      const [currentOrbitId, setCurrentOrbitId] = useAtom(currentOrbitIdAtom);
      return (
        <div>
          <div data-testid="currentOrbitId">{JSON.stringify(currentOrbitId)}</div>
          <button onClick={() => setCurrentOrbitId('newOrbitId')}>Set New Orbit</button>
        </div>
      );
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

      expect(screen.getByTestId('currentOrbitId').textContent).toBe('null');
    });

    it('should return the current orbit id when an orbit is selected', () => {
      renderWithJotai(<TestComponent />);

      const currentOrbitId = JSON.parse(screen.getByTestId('currentOrbitId').textContent || 'null');
      expect(currentOrbitId).not.toBeNull();
      expect(currentOrbitId.id).toBe(mockAppState.orbitNodes.currentOrbitHash);
    });

    it('should update the current orbit id when set', async () => {
      renderWithJotai(<TestComponent />);

      await act(async () => {
        await userEvent.click(screen.getByText('Set New Orbit'));
      });

      const updatedOrbitId = JSON.parse(screen.getByTestId('currentOrbitId').textContent || 'null');
      expect(updatedOrbitId).not.toBeNull();
      expect(updatedOrbitId.id).toBe('newOrbitId');
    });
  });

  describe('AppState - getOrbitIdFromEh', () => {
    const TestComponent = ({ orbitEh }: { orbitEh: EntryHashB64 }) => {
      const orbitIdAtom = useMemo(() => getOrbitIdFromEh(orbitEh), [orbitEh]);
      const [orbitId] = useAtom(orbitIdAtom);
      return <div data-testid="orbitId">{orbitId || 'null'}</div>;
    };

    it('should return the correct orbit id when the orbit exists', () => {
      const orbitEh = mockAppState.orbitNodes.byHash[mockAppState.orbitNodes.currentOrbitHash!].eH;
      renderWithJotai(<TestComponent orbitEh={orbitEh} />);

      expect(screen.getByTestId('orbitId').textContent).toBe(mockAppState.orbitNodes.currentOrbitHash);
    });

    it('should return null when the orbit does not exist', () => {
      renderWithJotai(<TestComponent orbitEh="nonExistentOrbitEH" />);

      expect(screen.getByTestId('orbitId').textContent).toBe('null');
    });
  });

  describe('AppState - getOrbitEhFromId', () => {
    const TestComponent = ({ orbitId }: { orbitId: ActionHashB64 }) => {
      const orbitEhAtom = useMemo(() => getOrbitEhFromId(orbitId), [orbitId]);
      const [orbitEh] = useAtom(orbitEhAtom);
      return <div data-testid="orbitEh">{orbitEh || 'null'}</div>;
    };

    it('should return the correct orbit entry hash when the orbit exists', () => {
      const orbitId = mockAppState.orbitNodes.currentOrbitHash;
      renderWithJotai(<TestComponent orbitId={orbitId!} />);

      expect(screen.getByTestId('orbitEh').textContent).toBe(mockAppState.orbitNodes.byHash[orbitId].eH);
    });

    it('should return null when the orbit does not exist', () => {
      renderWithJotai(<TestComponent orbitId="nonExistentOrbitId" />);

      expect(screen.getByTestId('orbitEh').textContent).toBe('null');
    });
  });

  describe('AppState - orbitWinDataAtom', () => {
    const TestComponent = ({ orbitId }: { orbitId: ActionHashB64 }) => {
      const winDataAtom = useMemo(() => orbitWinDataAtom(orbitId), [orbitId]);
      const [winData] = useAtom(winDataAtom);
      return <div data-testid="winData">{JSON.stringify(winData)}</div>;
    };

    it('should return win data for a specific orbit', () => {
      const orbitId = mockAppState.orbitNodes.currentOrbitHash;
      const mockWinData = { '2023-05-01': true, '2023-05-02': false };
      const modifiedMockState = {
        ...mockAppState,
        wins: {
          [orbitId!]: mockWinData,
        },
      };

      renderWithJotai(<TestComponent orbitId={orbitId!} />, { initialState: modifiedMockState });

      const winData = JSON.parse(screen.getByTestId('winData').textContent || '{}');
      expect(winData).toEqual(mockWinData);
    });

    it('should return an empty object if no win data exists for the orbit', () => {
      renderWithJotai(<TestComponent orbitId="orbitWithNoWinData" />);

      const winData = JSON.parse(screen.getByTestId('winData').textContent || '{}');
      expect(winData).toEqual({});
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
        ['sphere2Id', { 'orbit3EH': { id: 'orbit3', eH: 'orbit3EH', name: 'Orbit 3', sphereHash: 'sphere2Id' } } as any],
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

  describe('IndexDB - getCurrentSphereOrbitNodeDetailsFromEhAtom', () => {
    beforeEach(() => {
      resetMocks()
      clearCustomMocks();
      addCustomMock('all', mockedCacheEntries);
    })
    afterEach(() => {
      cleanup();
    });

    const TestComponent = ({ orbitEh }: { orbitEh: EntryHashB64 }) => {
      const getCurrentSphereOrbitNodeDetailsAtom = useMemo(() => getCurrentSphereOrbitNodeDetailsFromEhAtom(orbitEh), [orbitEh]);
      const [orbitNodeDetails] = useAtom(getCurrentSphereOrbitNodeDetailsAtom);
      return <div data-testid="orbitNodeDetails">{JSON.stringify(orbitNodeDetails)}</div>;
    };

    it('should return null when no sphere is selected', () => {
      const modifiedMockState = {
        ...mockAppState,
        spheres: {
          ...mockAppState.spheres,
          currentSphereHash: null,
        },
      };

      renderWithJotai(<TestComponent orbitEh="uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj" />, { initialState: modifiedMockState as any });

      expect(screen.getByTestId('orbitNodeDetails').textContent).toBe('null');
    });

    it('should return orbit details when the orbit exists in the current sphere', () => {
      renderWithJotai(<TestComponent orbitEh="uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj" />);

      const orbitNodeDetails = JSON.parse(screen.getByTestId('orbitNodeDetails').textContent || 'null');
      expect(orbitNodeDetails).not.toBeNull();
      expect(orbitNodeDetails.id).toBe('uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj');
      expect(orbitNodeDetails.name).toBe('Be the best');
    });

    it('should return null when the orbit does not exist in the current sphere', () => {
      renderWithJotai(<TestComponent orbitEh="nonExistentOrbitEH" />);

      expect(screen.getByTestId('orbitNodeDetails').textContent).toBe('null');
    });

    it('should return null when the current sphere has no orbit node details', () => {
      clearCustomMocks();
      addCustomMock('partial', [[mockAppState.spheres.currentSphereHash, null as any]]);

      renderWithJotai(<TestComponent orbitEh="uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj" />);

      expect(screen.getByTestId('orbitNodeDetails').textContent).toBe('null');
    });

    it('should update when the current sphere changes', async () => {
      const TestComponentWithSphereChange = ({ orbitEh }: { orbitEh: EntryHashB64 }) => {
        const [, setCurrentSphereHashes] = useAtom(currentSphereHashesAtom);
        const getCurrentSphereOrbitNodeDetailsAtom = useMemo(() => getCurrentSphereOrbitNodeDetailsFromEhAtom(orbitEh), [orbitEh]);
        const [orbitNodeDetails] = useAtom(getCurrentSphereOrbitNodeDetailsAtom);

        return (
          <div>
            <div data-testid="orbitNodeDetails">{JSON.stringify(orbitNodeDetails)}</div>
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
            sphere2Id: { details: { entryHash: 'sphere2EH' } },
          },
        },
      };

      clearCustomMocks();
      addCustomMock('partial', [
        [mockAppState.spheres.currentSphereHash, mockedCacheEntries[0][1]],
        ['sphere2Id', { 'orbit3EH': { id: 'orbit3', eH: 'orbit3EH', name: 'Orbit 3', sphereHash: 'sphere2Id' } } as any],
      ]);

      renderWithJotai(<TestComponentWithSphereChange orbitEh="orbit3EH" />, { initialState: modifiedMockState as any });
      await act(async () => {
        await userEvent.click(screen.getByText('Change Sphere'));
      });
      const updatedOrbitNodeDetails = JSON.parse(screen.getByTestId('orbitNodeDetails').textContent || 'null');
      expect(updatedOrbitNodeDetails).not.toBeNull();
      expect(updatedOrbitNodeDetails.id).toBe('orbit3');
      expect(updatedOrbitNodeDetails.name).toBe('Orbit 3');
    });
  });

  describe('IndexDB - getCurrentOrbitStartTimeFromEh', () => {
    beforeEach(() => {
      resetMocks()
      clearCustomMocks();
      addCustomMock('all', mockedCacheEntries);
    })
    afterEach(() => {
      cleanup();
    });

    const TestComponent = ({ orbitEh }: { orbitEh: EntryHashB64 }) => {
      const [getStartTime] = useAtom(getCurrentOrbitStartTimeFromEh);
      const startTime = getStartTime(orbitEh);
      return <div data-testid="startTime">{startTime !== null ? startTime.toString() : 'null'}</div>;
    };

    it('should return the start time when the orbit exists in the current sphere', () => {
      const orbitEh = 'uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj';
      renderWithJotai(<TestComponent orbitEh={orbitEh} />);

      const startTime = screen.getByTestId('startTime').textContent;
      expect(startTime).not.toBe('null');
      expect(Number(startTime)).toBe(1617235100);
    });

    it('should return null when the orbit does not exist in the current sphere', () => {
      renderWithJotai(<TestComponent orbitEh="nonExistentOrbitEH" />);

      expect(screen.getByTestId('startTime').textContent).toBe('null');
    });

    it('should return null when the current sphere has no orbit node details', () => {
      clearCustomMocks();
      addCustomMock('partial', [[mockAppState.spheres.currentSphereHash, null as any]]);

      renderWithJotai(<TestComponent orbitEh="uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj" />);

      expect(screen.getByTestId('startTime').textContent).toBe('null');
    });

    it('should return null when the orbit exists but has no start time', () => {
      const orbitEhWithNoStartTime = 'orbitWithNoStartTime';
      const modifiedCacheEntries = [
        ...mockedCacheEntries,
        [mockAppState.spheres.currentSphereHash, {
          [orbitEhWithNoStartTime]: { id: 'orbitId', eH: orbitEhWithNoStartTime, name: 'Orbit Without Start Time' }
        }]
      ];
      clearCustomMocks();
      addCustomMock('all', modifiedCacheEntries as any);

      renderWithJotai(<TestComponent orbitEh={orbitEhWithNoStartTime} />);

      expect(screen.getByTestId('startTime').textContent).toBe('null');
    });

    it('should update when the current sphere changes', async () => {
      const TestComponentWithSphereChange = ({ orbitEh }: { orbitEh: EntryHashB64 }) => {
        const [, setCurrentSphereHashes] = useAtom(currentSphereHashesAtom);
        const [getStartTime] = useAtom(getCurrentOrbitStartTimeFromEh);
        const startTime = getStartTime(orbitEh);

        return (
          <div>
            <div data-testid="startTime">{startTime !== null ? startTime.toString() : 'null'}</div>
            <button onClick={() => setCurrentSphereHashes({ actionHash: 'sphere2Id' })}>
              Change Sphere
            </button>
          </div>
        );
      };

      const modifiedMockState = {
        ...mockAppState,
        spheres: {
          ...mockAppState.spheres,
          byHash: {
            ...mockAppState.spheres.byHash,
            sphere2Id: { details: { entryHash: 'sphere2EH' } },
          },
        },
      };

      clearCustomMocks();
      addCustomMock('partial', [
        [mockAppState.spheres.currentSphereHash, mockedCacheEntries[0][1]],
        ['sphere2Id', { 'orbit3EH': { id: 'orbit3', eH: 'orbit3EH', name: 'Orbit 3', sphereHash: 'sphere2', startTime: 1620000000000 } } as any],
      ]);

      renderWithJotai(<TestComponentWithSphereChange orbitEh="orbit3EH" />, { initialState: modifiedMockState as any });

      expect(screen.getByTestId('startTime').textContent).toBe('null');

      await act(async () => {
        await userEvent.click(screen.getByText('Change Sphere'));
      });

      expect(screen.getByTestId('startTime').textContent).toBe('1620000000000');
    });
  });
});