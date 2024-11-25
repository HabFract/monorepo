import "./App.css";
import "habit-fract-design-system/dist/style.css";
import "./typo.css";

import { useStateTransition } from "./hooks/useStateTransition";
import withLayout from "./components/HOC/withLayout";

import Nav from "./components/navigation/Nav";
import { Flowbite } from "flowbite-react";
import { cloneElement, useMemo, useRef, useState } from "react";

import { Button, darkTheme, Spinner } from "habit-fract-design-system";
import {
  useGetSpheresQuery,
} from "./graphql/generated";
import { ALPHA_RELEASE_DISCLAIMER } from "./constants";

import { isSmallScreen } from "./components/vis/helpers";
import OnboardingHeader, {
  getNextOnboardingState,
} from "./components/header/OnboardingHeader";
import VersionWithDisclaimerButton from "./components/home/VersionWithDisclaimerButton";
import { useOnboardingScroll } from "./hooks/useOnboardingScroll";
import { useMainContainerClass } from "./hooks/useMainContainerClass";
import { useCurrentVersion } from "./hooks/useCurrentVersion";
import OnboardingContinue from "./components/forms/buttons/OnboardingContinueButton";
import Toast from "./components/Toast";
import { useModal } from "./contexts/modal";
import { AppMachine } from "./main";
import { extractEdges } from "./graphql/utils";

function App({ children: pageComponent }) {
  const [_, transition, params] = useStateTransition(); // Top level state machine and routing
  const state = AppMachine.state.currentState;

  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(false); // Adds and removes expanded class to side-nav

  const { showModal } = useModal();
  const mainContainerClass = useMainContainerClass();
  const currentVersion = useCurrentVersion();

  // Allow auto scrolling back to top of onboarding stages/to relevant progress step
  const progressBarRef = useRef<HTMLDivElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);
  const returningUser = !!params?.spin; // Assume that the first time we do not pass this param
  useOnboardingScroll(state, progressBarRef, mainPageRef, returningUser);

  const showDisclaimer = () => {
    showModal({
      title: "Disclaimer",
      message: ALPHA_RELEASE_DISCLAIMER,
      withConfirm: true,
      withCancel: false,
      size: "md"
    });
  };

  const {
    loading: loadingSpheres,
    error,
    data: spheres,
  } = useGetSpheresQuery();
  const spheresArray = spheres?.spheres?.edges && extractEdges(spheres.spheres);
  const userHasSpheres = spheresArray && spheresArray.length > 0;
  const showNav = useMemo(() => {
    return userHasSpheres && isSmallScreen() && state === "Vis";
  }, [userHasSpheres, state]);

  return (
    <Flowbite theme={{ theme: darkTheme, mode: "dark" }}>
      <Toast />
      <main ref={mainPageRef} className={mainContainerClass}>
        {/* Version and alpha status disclaimer */}
        {state == "Home" && !userHasSpheres && (
          <VersionWithDisclaimerButton
            currentVersion={currentVersion}
            open={showDisclaimer}
          />
        )}
        {/* Return users can see a side Nav on certain pages */}
        {showNav && (
          <Nav
            sideNavExpanded={sideNavExpanded}
            setSideNavExpanded={setSideNavExpanded}
          ></Nav>
        )}

        {loadingSpheres ? (
          <Spinner />
        ) : (
          pageComponent &&
          withLayout(
            cloneElement(pageComponent, {
              // Only Renders when state includes "Onboarding"
              headerDiv: state.match("Onboarding") && (
                <OnboardingHeader
                  //@ts-ignore
                  ref={progressBarRef}
                />
              ),
              submitBtn: state.match("Onboarding") && (
                <OnboardingContinue
                  onClick={() => {
                    const nextStage = getNextOnboardingState(state);
                    const lastStageCompleted = nextStage == "Vis"
                    transition(nextStage, lastStageCompleted ? { returningUser,  currentSphereDetails: { ...spheresArray![spheresArray!.length -1] }, ...(params||{}) } : (params||{}))
                  }}
                />
              ),
            }),
          )({ ...pageComponent.props, newUser: !userHasSpheres })
        )}
      </main>
    </Flowbite>
  );
}

export default App;
