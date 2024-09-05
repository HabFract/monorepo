
import { Provider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";

import { currentSphere } from '../ui/src/state/currentSphereHierarchyAtom';
import { currentOrbitCoords } from '../ui/src/state/orbit';

import { SPHERE_ID } from "./integration/mocks/spheres";
import { ReactNode } from "react";
import { ToastProvider } from "../ui/src/contexts/toast";

const HydrateAtoms = ({ initialValues, children }) => {
  useHydrateAtoms(initialValues)
  return children
}

export const WithCurrentSphereMockedAtom = (Component: React.ReactComponentElement<any> | ReactNode) => (
  <TestProvider initialValues={[
    [currentSphere, { entryHash: SPHERE_ID, actionHash: SPHERE_ID }],
  ]}><ToastProvider>
      {Component}
    </ToastProvider>
  </TestProvider>
)

export const WithCurrentOrbitCoordsMockedAtom = (Component: React.ReactComponentElement<any> | ReactNode, coords: { x: number, y: number }): ReactNode => (
  <TestProvider initialValues={[[currentOrbitCoords, coords],]}><ToastProvider>
    {Component}
  </ToastProvider></TestProvider>
)

export const TestProvider = ({ initialValues, children }) => (
  <Provider>
    <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
  </Provider>
)