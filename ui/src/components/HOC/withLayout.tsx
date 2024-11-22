import { ReactNode, FC, useEffect } from "react";
import Home from "../layouts/Home";
import Onboarding from "../layouts/Onboarding";
import { AnimatePresence, motion } from "framer-motion";
import { useDeleteSphereMutation } from "../../graphql/generated";
import VisLayout from "../layouts/VisLayout";
import FormLayout from "../layouts/FormLayout";
import ListLayout from "../layouts/List";
import { currentSphereHashesAtom, store } from "../../state";
import { useModal } from "../../contexts/modal";
import { AppMachine } from "../../main";
import { useStateTransition } from "../../hooks/useStateTransition";
import SettingsLayout from "../layouts/SettingsLayout";

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
  const state = AppMachine.state.currentState; // Top level state machine and routing
  const { showModal } = useModal();
  const [_, transition, params] = useStateTransition(); // Top level state machine and routing

  const [
    runDeleteSphere,
    { loading: loadingDelete, error: errorDelete, data: dataDelete },
  ] = useDeleteSphereMutation({
    refetchQueries: ["getSpheres"],
  });

  return (props: WithLayoutProps): ReactNode => {
    if(props?.currentSphereDetails?.eH && props.currentSphereDetails.eH !== store.get(currentSphereHashesAtom)?.entryHash) {
      const eH = props?.currentSphereDetails?.eH;
      const id = props?.currentSphereDetails?.id;
      console.log('set current Sphere to :>> ',  {entryHash: eH, actionHash: id});
      store.set(currentSphereHashesAtom, {entryHash: eH, actionHash: id})
    }

    const handleDeleteSphere = () => {
      const id = store.get(currentSphereHashesAtom)?.actionHash;
      if(!id) return;
      showModal({
        title: "Are you sure?",
        message: "This action cannot be undone! This will not only delete your Space's details, but all Plannits linked to that Space, and the Win history of those Plannits!",
        onConfirm: () => {
          runDeleteSphere({ variables: { id } })
          transition("Home")
        },
        withCancel: true,
        withConfirm: true,
        destructive: true,
        confirmText: "Yes, do it",
        cancelText: "Cancel"
      });
    }

    // console.log('Layout props', props)
    switch (true) {
      case !!state.match("Onboarding"):
        return <Onboarding>{withPageTransition(React.cloneElement(component as any, {props}))}</Onboarding>;
      case ["Home", "PreloadAndCache"].includes(state):
        if (state == "Home")
          return <Home firstVisit={props?.newUser}></Home>;
        return withPageTransition(component);
      case state == "Settings":
        return <SettingsLayout>
          {component}
        </SettingsLayout>
      case state == "Vis":
        return <VisLayout title={props.currentSphereDetails?.name}>
          {component}
        </VisLayout>
      case ["CreateOrbit", "CreateSphere"].includes(state):
        return <FormLayout type={state.split('Create')[1]}>
          {component}
        </FormLayout>
      case ["ListOrbits"].includes(state):
        return <ListLayout type={'orbit'} title={props.currentSphereDetails?.name} primaryMenuAction={() => {}} secondaryMenuAction={() => {handleDeleteSphere()}}>
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
