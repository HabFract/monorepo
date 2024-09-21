// tests/testUtils.ts
import { atom } from 'jotai';
import { AppState } from '../ui/src/state/store';
import { mockAppState } from './integration/mocks/mockAppState';

export const createTestStore = (initialState: Partial<AppState> = {}) => {
  const testState = { ...mockAppState, ...initialState };
  return atom(testState);
};

export const createTestCache = (initialCache: Record<string, any> = {}) => {
  return {
    entries: atom(initialCache),
    keys: atom(Object.keys(initialCache)),
    items: atom(Object.values(initialCache)),
  };
};