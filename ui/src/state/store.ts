import { atomWithStorage } from 'jotai/utils';
import OrbitState from './types/orbit';
import SphereState from './types/sphere';
import WinState from './types/win';

export interface AppState {
  spheres: SphereState;
  orbits: OrbitState;
  wins: WinState;
  // UI
  listSortFilter: {
    sortCriteria: string;
    sortOrder: string;
  };
  currentDay: string;
  // Onboarding
  subdivisionList: string[];
}

// Create a persisted atom for the entire app state
export const appStateAtom = atomWithStorage<AppState>('appState', {
  spheres: {
    currentSphereHash: '',
    spheres: {},
  },
  wins: {},
  orbits: {
    currentOrbitId: null,
  },
  currentDay: new Date().toISOString(),
  listSortFilter: {
    sortCriteria: 'name',
    sortOrder: 'lowestToGreatest',
  },
  subdivisionList: [],
});