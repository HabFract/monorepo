// tests/testUtils.ts
import { atom, createStore } from 'jotai';
import { AppState } from '../ui/src/state/store';
import { mockAppState } from './integration/mocks/mockAppState';
import { OrbitNodeDetails } from '../ui/src/state/types/orbit';

export const createTestStore = (initialState: Partial<AppState> = {}) => {
  const testState = { ...mockAppState, ...initialState };
  return createStore();
};

export const createTestCache = (initialCache: Record<string, OrbitNodeDetails> = {}) => {
  return {
    entries: atom(initialCache),
    keys: atom(Object.keys(initialCache)),
    items: atom(Object.values(initialCache)),
  };
};