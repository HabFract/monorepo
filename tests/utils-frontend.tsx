import React, { ReactNode } from "react";
import { Provider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";
import { createStore } from "jotai";
import { appStateAtom, nodeCache } from "../ui/src/state/store";
import mockAppState from "./integration/mocks/mockAppState";
import { render, RenderResult } from "@testing-library/react";
import { AppState } from "../ui/src/state/types/store";
import { Coords, currentSphereHierarchyIndices } from "../ui/src/state";
import { withVisCanvas } from "../ui/src/components/HOC/withVisCanvas";
import { IVisualization, VisProps } from "../ui/src/components/vis/types";
import { MockedProvider as ApolloProvider } from "@apollo/client/testing";
import { HIERARCHY_MOCKS } from "./integration/mocks/hierarchy-root-only";
import { InMemoryCache } from "@apollo/client";

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
  // const cache = new InMemoryCache().restore({
  //   ROOT_QUERY: {
  //     user: {
  //       type: 'id',
  //       id: 'asdf',
  //       generated: false,
  //     },
  //   },
  //   asdf: {
  //     companyName: 'Example Company',
  //     email: 'test@example.com',
  //     __typename: 'user',
  //   },
  // });
  console.log('initialHierarchy :>> ', initialHierarchy);
  return <Provider>
    <HydrateAtoms initialValues={initialValues}>
      <ApolloProvider mocks={initialHierarchy} addTypename={false}>
        {children}
      </ApolloProvider>
    </HydrateAtoms>,
  </Provider>
}