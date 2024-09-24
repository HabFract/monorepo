import React from "react";
import { Provider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";
import { atom, createStore } from "jotai";
import { AppState } from "../ui/src/state/store";
import { OrbitNodeDetails } from "../ui/src/state/types/orbit";
import mockAppState from "./integration/mocks/mockAppState";
import { ToastProvider } from "../ui/src/contexts/toast";
import { render, RenderResult } from "@testing-library/react";

export const renderWithJotai = (
  ui: React.ReactElement,
  { initialState = {}, initialCache = {} } = {}
): RenderResult => {
  const testStore = createTestStore(initialState);
  const testCache = createTestCache(initialCache);

  return render(
    <Provider store={testStore}>
      {React.cloneElement(ui, { nodeCache: testCache })}
    </Provider>
  );
};

const HydrateAtoms = ({ initialValues, children }) => {
  useHydrateAtoms(initialValues)
  return children
}

export const TestProvider = ({ initialValues, children }) => (
  <Provider>
    {/* <ToastProvider> */}
      <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    {/* </ToastProvider> */}
  </Provider>
)

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