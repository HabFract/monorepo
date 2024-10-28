import React, { ReactNode } from "react";
import { Provider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";
import { createStore } from "jotai";
import { appStateAtom } from "../ui/src/state/store";
import mockAppState from "./integration/mocks/mockAppState";
import { render, RenderResult } from "@testing-library/react";
import { AppState } from "../ui/src/state/types/store";
import { currentOrbitDetailsAtom, currentSphereHierarchyIndices } from "../ui/src/state";
import { withVisCanvas } from "../ui/src/components/HOC/withVisCanvas";
import { IVisualization, VisProps } from "../ui/src/components/vis/types";
import { MockedProvider as ApolloProvider } from "@apollo/client/testing";

export const renderVis = (
  visComponent: React.ComponentType<VisProps<IVisualization>>,
): ReactNode => (
  <>
    <div id="vis-root" className="h-full"></div>
    {withVisCanvas(visComponent)}
  </>
);

export const createTestStore = (initialState: Partial<AppState> = {}) => {
  const testState = { ...mockAppState, ...initialState };
  const store = createStore();
  store.set(appStateAtom, testState);
  return store;
};

export const renderWithJotai = (
  element: React.ReactElement,
  { initialState = mockAppState, initialHierarchy = [] } = {}
): RenderResult => {
  const testStore = createTestStore(initialState);

  return render(
    <Provider store={testStore}>
      <TestProvider initialHierarchy={initialHierarchy} initialValues={[
        [appStateAtom, initialState],
        [currentSphereHierarchyIndices, { x: 0, y: 0 }],
      ]}>
        {React.cloneElement(element)}
      </TestProvider>
    </Provider>
  );
};

const HydrateAtoms = ({ initialValues, children }) => {
  useHydrateAtoms(initialValues);
  return children;
}

export const TestProvider = ({ initialValues, initialHierarchy, children }) => {
  return <HydrateAtoms initialValues={initialValues}>
    <ApolloProvider mocks={initialHierarchy} addTypename={false}>
      {children}
    </ApolloProvider>
  </HydrateAtoms>
}