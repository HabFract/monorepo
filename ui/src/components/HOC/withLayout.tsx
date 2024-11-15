import { ReactNode, FC } from "react";
import Breadcrumbs from "../navigation/Breadcrumbs";
import Home from "../layouts/Home";
import Onboarding from "../layouts/Onboarding";
import { AnimatePresence, motion } from "framer-motion";
import { Sphere } from "../../graphql/generated";
import { AppMachine } from "../../main";
import { SphereDetails } from "../../state/types/sphere";
import VisLayout from "../layouts/VisLayout";
import FormLayout from "../layouts/FormLayout";
import ListLayout from "../layouts/List";

function withPageTransition(page: ReactNode) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="framer-motion"
        key={+new Date()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {page}
      </motion.div>
    </AnimatePresence>
  );
}

interface WithLayoutProps {
  currentSphereDetails: SphereDetails;
  newUser: boolean;
}

const withLayout = (
  component: ReactNode,
  transition: Function
): FC<WithLayoutProps> => {
  return (props: WithLayoutProps): ReactNode => {
    const state = AppMachine.state.currentState;
    const params = AppMachine.state.params;
    switch (true) {
      case !!state.match("Onboarding"):
        return <Onboarding>{withPageTransition(component)}</Onboarding>;
      case ["Home", "PreloadAndCache"].includes(state):
        if (state == "Home" && props?.newUser)
          return <Home firstVisit={false}></Home>;
        return withPageTransition(component);
      case state == "Vis":
        return <VisLayout currentSphereName={props.currentSphereDetails.name}>
          {component}
        </VisLayout>
      case ["CreateOrbit", "CreateSphere"].includes(state):
        return <FormLayout type={state.split('Create')[1]}>
          {component}
        </FormLayout>
      case ["ListOrbits"].includes(state):
        return <ListLayout type={'orbit'}>
          {component}
        </ListLayout>
      default:
        return (
            <>{component}</>
        );
    }
  };
};

export default withLayout;
