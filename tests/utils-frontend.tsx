
import { Provider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";
import { ToastProvider } from "../ui/src/contexts/toast";

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