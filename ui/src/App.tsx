import "./App.css";
import "habit-fract-design-system/dist/style.css";
import "./typo.css";

import { useStateTransition } from "./hooks/useStateTransition";
import withLayout from "./components/HOC/withLayout";

import Nav from "./components/navigation/Nav";
import { Flowbite } from "flowbite-react";
import { cloneElement, useRef, useState } from "react";

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
  useOnboardingScroll(state, progressBarRef, mainPageRef);

  const showDisclaimer = () => {
    showModal({
      title: "Disclaimer",
      message: ALPHA_RELEASE_DISCLAIMER,
      confirmText: "I Understand",
      cancelText: "Close",
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
  const userHasSpheres =
    spheres?.spheres?.edges && spheres.spheres.edges.length > 0;

  return (
    <Flowbite theme={{ theme: darkTheme, mode: "dark" }}>
      <Toast />
      <main ref={mainPageRef} className={mainContainerClass}>
        {/* Version and alpha status disclaimer */}
        {state == "Home" && !userHasSpheres && (
          <VersionWithDisclaimerButton
            currentVersion={currentVersion}
            open={showDisclaimer}
            isFrontPage={true}
          />
        )}
        {/* Return users can see a side Nav on certain pages */}
        {userHasSpheres &&
          isSmallScreen() &&
          state == "Vis" && (
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
              // Only Renders when state == "Home"
              startBtn: state.match("Home") ? (
                <Button type={"button"} variant={"primary"} onClick={() => transition("Onboarding1")}>
                  Sign In
                </Button>
              ) : (
                <></>
              ),
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
                    const lastStageCompleted = nextStage == "PreloadAndCache"
                    transition(nextStage, lastStageCompleted ? {} : {})
                  }}
                />
              ),
            }),
          )({ currentSphereDetails: pageComponent.props.currentSphereDetails, newUser: !!userHasSpheres })
        )}
      </main>
    </Flowbite>
  );
}

export default App;
