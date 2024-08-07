
import { Provider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";

import { currentOrbitCoords, currentSphere } from '../ui/src/state/currentSphereHierarchyAtom';
import { SPHERE_ID } from "./e2e/mocks/spheres";
import { ReactNode } from "react";

const HydrateAtoms = ({ initialValues, children }) => {
  useHydrateAtoms(initialValues)
  return children
}

export const WithCurrentSphereMockedAtom = (Component: React.ReactComponentElement<any> | ReactNode) => (
  <TestProvider initialValues={[
    [currentSphere, { entryHash: SPHERE_ID, actionHash: SPHERE_ID }],
  ]}>
    {Component}
  </TestProvider>
)

export const WithCurrentOrbitCoordsMockedAtom = (Component: React.ReactComponentElement<any> | ReactNode, coords: {x: number, y: number}) : ReactNode => (
  <TestProvider initialValues={[ [currentOrbitCoords, coords], ]}> {Component} </TestProvider>
)

export const TestProvider = ({ initialValues, children }) => (
  <Provider>
    <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
  </Provider>
)