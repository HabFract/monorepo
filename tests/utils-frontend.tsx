import React from "react";
import { Provider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";
import { atom, createStore } from "jotai";
import { AppState, appStateAtom } from "../ui/src/state/store";
import { OrbitNodeDetails } from "../ui/src/state/types/orbit";
import mockAppState from "./integration/mocks/mockAppState";
import { render, RenderResult } from "@testing-library/react";
import { SphereOrbitNodes } from "../ui/src/state/types/sphere";
import { mockedCacheEntries } from "./integration/mocks/mockNodeCache";

export const renderWithJotai = (
  element: React.ReactElement,
  { initialState = mockAppState, initialCache = Object.fromEntries(mockedCacheEntries) } = {}
): RenderResult => {
  const testStore = createTestStore(initialState);
  const testCache = createTestIndexDBAtom(initialCache);

  return render(
    <Provider store={testStore}>
      <TestProvider initialValues={[[appStateAtom, testStore.get(appStateAtom)]]}>
        {React.cloneElement(element)}
      </TestProvider>
    </Provider>
  );
};

const HydrateAtoms = ({ initialValues, children }) => {
  useHydrateAtoms(initialValues)
  return children
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

export const createTestIndexDBAtom = (initialCache: SphereOrbitNodes = {}) => {
  return {
    entries: atom(Object.entries(initialCache)),
    keys: atom(Object.keys(initialCache)),
    items: atom(Object.values(initialCache)),
  };
};
