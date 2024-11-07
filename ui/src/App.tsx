import "./App.css";
import "habit-fract-design-system/dist/style.css";
import "./typo.css";

import { useStateTransition } from "./hooks/useStateTransition";
import withLayout from "./components/HOC/withLayout";

import Nav from "./components/navigation/Nav";
import { DarkThemeToggle, Flowbite, Modal, Spinner } from "flowbite-react";
import { cloneElement, useRef, useState } from "react";

import Settings from "./components/Settings";

import { darkTheme } from "habit-fract-design-system";
import { store } from "./state/store";
import {
  Sphere,
  SphereConnection,
  useGetSpheresQuery,
} from "./graphql/generated";
import { ALPHA_RELEASE_DISCLAIMER } from "./constants";

import { isSmallScreen } from "./components/vis/helpers";
import { extractEdges } from "./graphql/utils";
import OnboardingHeader, {
  getNextOnboardingState,
} from "./components/header/OnboardingHeader";
import VersionWithDisclaimerButton from "./components/home/VersionWithDisclaimerButton";
import { useOnboardingScroll } from "./hooks/useOnboardingScroll";
import { useMainContainerClass } from "./hooks/useMainContainerClass";
import { useCurrentVersion } from "./hooks/useCurrentVersion";
import OnboardingContinue from "./components/forms/buttons/OnboardingContinueButton";
import HomeContinue from "./components/home/HomeContinueButton";
import Toast from "./components/Toast";
import { useToast } from "./contexts/toast";
import { currentSphereDetailsAtom, currentSphereHashesAtom } from "./state/sphere";

function App({ children: pageComponent }) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing

  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(false); // Adds and removes expanded class to side-nav

  const { showToast, isToastVisible } = useToast();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Displays top level modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const mainContainerClass = useMainContainerClass();
  const currentVersion = useCurrentVersion();

  // Allow auto scrolling back to top of onboarding stages/to relevant progress step
  const progressBarRef = useRef<HTMLDivElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);
  useOnboardingScroll(state, progressBarRef, mainPageRef);

  const {
    loading: loadingSpheres,
    error,
    data: spheres,
  } = useGetSpheresQuery();
  const userHasSpheres =
    spheres?.spheres?.edges && spheres.spheres.edges.length > 0;

  const currentSphereDetails = store.get(currentSphereDetailsAtom);
  return (
    <Flowbite theme={{ theme: darkTheme, dark: true  }}>
      <Toast />
      <main ref={mainPageRef} className={mainContainerClass}>
        {/* Version and alpha status disclaimer */}
        {state == "Home" && !userHasSpheres && (
          <VersionWithDisclaimerButton
            currentVersion={currentVersion}
            open={() => setIsModalOpen(true)}
            isFrontPage={true}
          />
        )}
        {/* Return users can see a side Nav on certain pages */}
        {userHasSpheres &&
          !(
            (isSmallScreen() &&
              [
                "CreateSphere",
                "ListSpheres",
                "CreateOrbit",
                "ListOrbits",
              ].includes(state)) ||
            state.match("Onboarding")
          ) && (
            <Nav
              transition={transition}
              sideNavExpanded={sideNavExpanded}
              setSettingsOpen={() => {
                setIsModalOpen(true);
                setIsSettingsOpen(true);
              }}
              setSideNavExpanded={setSideNavExpanded}
            ></Nav>
          )}

        {loadingSpheres ? (
          <Spinner aria-label="Loading!" size="xl" className="full-spinner" />
        ) : (
          pageComponent &&
          withLayout(
            cloneElement(pageComponent, {
              // Only Renders when state == "Home"
              startBtn: state.match("Home") ? (
                <HomeContinue onClick={() => transition("Onboarding1")} />
              ) : (
                <></>
              ),
              // Only Renders when state includes "Onboarding"
              headerDiv: state.match("Onboarding") && (
                <OnboardingHeader
                  state={state}
                  transition={transition}
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
            transition,
          )({ currentSphereDetails, newUser: !!userHasSpheres })
        )}
      </main>

      <DarkThemeToggle />
      <Modal
        dismissible
        show={isModalOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setIsModalOpen(false);
        }}
      >
        <Modal.Header>
          {isSettingsOpen ? "Settings" : "Disclaimer:"}
        </Modal.Header>
        <Modal.Body>
          {isSettingsOpen ? (
            <Settings
              version={currentVersion || ""}
              spheres={spheres?.spheres as SphereConnection}
              setIsModalOpen={setIsModalOpen}
              setIsSettingsOpen={setIsSettingsOpen}
            />
          ) : (
            <p className="disclaimer">{ALPHA_RELEASE_DISCLAIMER}</p>
          )}
        </Modal.Body>
      </Modal>
    </Flowbite>
  );
}

export default App;
