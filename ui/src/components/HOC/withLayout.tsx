import { ReactNode, FC, useEffect, memo, useCallback, useMemo } from "react";
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
import { useToast } from "../../contexts/toast";
import { VisProvider } from "../../contexts/vis";

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 1
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeIn"
    }
  }
};

function withPageTransition(page: ReactNode, state: string) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="framer-motion"
        key={state}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.4 }}
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

const withLayout = (component: ReactNode): FC<WithLayoutProps> => {
  return memo(({ currentSphereDetails, newUser }: WithLayoutProps): ReactNode => {
    const state = AppMachine.state.currentState;
    const { showModal } = useModal();
    const [_, transition, params] = useStateTransition();
    const { hideToast } = useToast();

    const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);
    if (currentSphereDetails?.eH && currentSphereDetails.eH !== store.get(currentSphereHashesAtom)?.entryHash) {
      const eH = currentSphereDetails?.eH;
      const id = currentSphereDetails?.id;
      // console.log('set current Sphere to :>> ', { entryHash: eH, actionHash: id });
      store.set(currentSphereHashesAtom, id)
    }

    const [runDeleteSphere] = useDeleteSphereMutation({
      refetchQueries: ["getSpheres"],
    });

    useEffect(() => {
      hideToast();
      return () => hideToast();
    }, [hideToast]);

    const handleDeleteSphere = useCallback(() => {
      const id = store.get(currentSphereHashesAtom)?.actionHash;
      if (!id) return;

      showModal({
        title: "Are you sure?",
        message: "This action cannot be undone...",
        onConfirm: () => {
          runDeleteSphere({ variables: { id } });
          transition("Home");
        },
        withCancel: true,
        withConfirm: true,
        destructive: true,
        confirmText: "Yes, do it",
        cancelText: "Cancel"
      });
    }, [showModal, runDeleteSphere, transition]);

    // Wrap the content based on state
    const getLayoutContent = useCallback(() => {
      const wrappedContent = (layoutComponent: ReactNode) =>
        withPageTransition(layoutComponent, state);

      switch (true) {
        case !!state.match("Onboarding"):
          return <Onboarding>{component}</Onboarding>;

        case ["Home", "PreloadAndCache"].includes(state):
          if (state === "Home") {
            return wrappedContent(<Home firstVisit={newUser} />);
          }
          return wrappedContent(component);

        case state === "Settings":
          return wrappedContent(
            <SettingsLayout>{component}</SettingsLayout>
          );

        case state === "Vis":
          return wrappedContent(
            <VisProvider>
              <VisLayout
                title={currentSphereDetails?.name}
                handleDeleteSphere={handleDeleteSphere}
                params={memoizedParams}
              >
                {component}
              </VisLayout>
            </VisProvider>
          );

        case ["CreateOrbit", "CreateSphere"].includes(state):
          return wrappedContent(
            <FormLayout
              type={state.split('Create')[1]}
            >
              {component}
            </FormLayout>
          );

        case ["ListOrbits"].includes(state):
          return wrappedContent(
            <ListLayout
              type="orbit"
              title={currentSphereDetails?.name}
              primaryMenuAction={() => { }}
              secondaryMenuAction={handleDeleteSphere}
            >
              {component}
            </ListLayout>
          );

        default:
          return wrappedContent(component);
      }
    }, [
      state,
      component,
      currentSphereDetails,
      handleDeleteSphere,
      newUser,
      memoizedParams
    ]);
    return getLayoutContent();
  });
};

export default withLayout;