import React from "react";
import { Provider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";
import { createStore } from "jotai";
import { appStateAtom, nodeCache } from "../ui/src/state/store";
import mockAppState from "./integration/mocks/mockAppState";
import { render, RenderResult } from "@testing-library/react";
import { AppState } from "../ui/src/state/types/store";
import { createTestIndexDBAtom, mockedCacheEntries } from "./setupMockStore";

export const renderWithJotai = (
  element: React.ReactElement,
  { initialState = mockAppState, initialCache = Object.fromEntries(mockedCacheEntries) } = {}
): RenderResult => {
  const testStore = createTestStore(initialState);
  const testCache = createTestIndexDBAtom(initialCache);

  return render(
    <Provider store={testStore}>
      <TestProvider initialValues={[
        [appStateAtom, testStore.get(appStateAtom)],
        [nodeCache.entries, testCache.entries],
      ]}>
        {React.cloneElement(element)}
      </TestProvider>
    </Provider>
  );
};

const HydrateAtoms = ({ initialValues, children }) => {
  const writableAtoms = initialValues.filter(([atom]) =>
    atom && typeof atom === 'object' && 'write' in atom
  );

  useHydrateAtoms(writableAtoms);
  return children;
}

export const TestProvider = ({ initialValues, children }) => (
  <Provider>
    <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
  </Provider>
)

export const createTestStore = (initialState: Partial<AppState> = {}) => {
  const testState = { ...mockAppState, ...initialState };
  const store = createStore();
  store.set(appStateAtom, testState);
  return store;
};