import { atomWithStorage } from 'jotai/utils';
import OrbitState, { OrbitDetails, OrbitNodeDetails, RootOrbitEntryHash } from './types/orbit';
import SphereState, { SphereDetails } from './types/sphere';
import WinState from './types/win';
import { ActionHashB64 } from '@holochain/client';
import { Hierarchy } from './types/hierarchy';

export interface AppState {
  spheres: {
    currentSphereHash: ActionHashB64;
    byHash: Record<ActionHashB64, {
      details: SphereDetails;
      hierarchyRootOrbitEntryHashes: RootOrbitEntryHash[];
    }>;
  };
  hierarchies: {
    byRootOrbitEntryHash: Record<RootOrbitEntryHash, Hierarchy>;
  };
  orbitNodes: {
    currentOrbitHash: ActionHashB64 | null;
    byHash: Record<ActionHashB64, OrbitNodeDetails>;
  };
  wins: WinState;
  ui: {
    listSortFilter: {
      sortCriteria: string;
      sortOrder: string;
    };
    currentDay: string;
    subdivisionList: string[];
  };
}

/**
 * Persisted atom for the entire app state, can be used to hydrate app state when no Holochain is possible
 */
export const appStateAtom = atomWithStorage<AppState>('appState', {
  spheres: {
    currentSphereHash: '',
    byHash: {},
  },
  hierarchies: {
    byRootOrbitEntryHash: {},
  },
  orbitNodes: {
    currentOrbitHash: null,
    byHash: {},
  },
  wins: {},
  ui: {
    listSortFilter: {
      sortCriteria: 'name',
      sortOrder: 'lowestToGreatest',
    },
    currentDay: new Date().toISOString(),
    subdivisionList: [],
  },
});