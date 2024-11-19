import { ReactNode, FC, useEffect } from "react";
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
import { appStateAtom, currentSphereDetailsAtom, currentSphereHashesAtom, store } from "../../state";

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
  currentSphereDetails: any;
  newUser: boolean;
}

const withLayout = (
  component: ReactNode,
): FC<WithLayoutProps> => {
  return (props: WithLayoutProps): ReactNode => {
    const state = AppMachine.state.currentState;
    if(props?.currentSphereDetails?.eH && props.currentSphereDetails.eH !== store.get(currentSphereHashesAtom)?.entryHash) {
      const eH = props?.currentSphereDetails?.eH;
      const id = props?.currentSphereDetails?.id;
      store.set(currentSphereHashesAtom, {entryHash: eH, actionHash: id})
    }

    const currentAppState = store.get(appStateAtom);
    // Add validation logging
    useEffect(() => {
      console.log('Layout mounted with appState:', currentAppState);
      return () => {
        console.log('Layout unmounting with appState:', store.get(appStateAtom));
      };
    }, []);


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
