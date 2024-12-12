import "./App.css";
import "habit-fract-design-system/dist/style.css";
import "./typo.css";

import { useStateTransition } from "./hooks/useStateTransition";
import withLayout from "./components/HOC/withLayout";

import Nav from "./components/navigation/Nav";
import { Flowbite } from "flowbite-react";
import { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { darkTheme, Spinner } from "habit-fract-design-system";
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

export const logMemoryUsage = (tag: string) => {
  if (process.env.NODE_ENV === 'development') {
    const memory = (performance as any).memory;
    console.log(`Memory Usage [${tag}]:`, {
      jsHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      totalHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    });
  }
};
function App({ children: pageComponent }) {
  const [_, transition, params] = useStateTransition(); // Top level state machine and routing
  const state = AppMachine.state.currentState;

  // useEffect(() => {
  //   logMemoryUsage('Page Load');

  //   return () => {
  //     logMemoryUsage('Page Unload');
  //   };
  // }, [state]); // Log on state changes

  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(false); // Adds and removes expanded class to side-nav

  const { showModal } = useModal();
  const mainContainerClass = useMainContainerClass();
  const currentVersion = useCurrentVersion();

  // Allow auto scrolling back to top of onboarding stages/to relevant progress step
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const mainPageRef = useRef<HTMLDivElement | null>(null);
  const returningUser = !!params?.spin; // Assume that the first time we do not pass this param
  useOnboardingScroll(state, progressBarRef, mainPageRef, returningUser);

  // Cleanup refs on unmount
  useEffect(() => {
    return () => {
      progressBarRef.current = null;
      mainPageRef.current = null;
    };
  }, []);
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (global.gc) {
        global.gc();
      }
    }, 30000); // Run every 30 seconds

    return () => {
      clearInterval(cleanup);
    };
  }, []);

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

  const handleDisclaimer = useCallback(() => {
    showModal({
      title: "Disclaimer",
      message: ALPHA_RELEASE_DISCLAIMER,
      withConfirm: true,
      withCancel: false,
      size: "sm"
    });
  }, [showModal]);

  const handleOnboardingContinue = useCallback(() => {
    const nextStage = getNextOnboardingState(state);
    const lastStageCompleted = nextStage == "Vis";
    transition(nextStage, lastStageCompleted ? {
      returningUser,
      currentSphereDetails: { ...spheresArray![spheresArray!.length - 1] },
      ...(params || {})
    } : (params || {}));
  }, [state, transition, returningUser, spheresArray, params]);

  const enhancedPageComponent = useMemo(() => {
    if (!pageComponent) return null;

    return cloneElement(pageComponent, {
      headerDiv: state.match("Onboarding") && (
        //@ts-ignore
        <OnboardingHeader ref={progressBarRef} />
      ),
      submitBtn: state.match("Onboarding") && (
        <OnboardingContinue onClick={handleOnboardingContinue} />
      ),
    });
  }, [pageComponent, state, handleOnboardingContinue]);

  // Apply layout wrapper
  const layoutProps = useMemo(() => ({
    currentSphereDetails: params?.currentSphereDetails,
    newUser: !userHasSpheres
  }), [params?.currentSphereDetails, userHasSpheres]);

  const WrappedComponent = useMemo(() => {
    if (!enhancedPageComponent) return null;
    const LayoutComponent = withLayout(enhancedPageComponent);
    return <LayoutComponent {...layoutProps} />;
  }, [enhancedPageComponent, layoutProps]);

  if (loadingSpheres) return <Spinner />;

  return (
    <Flowbite theme={{ theme: darkTheme, mode: "dark" }}>
      <Toast />
      <main ref={mainPageRef} className={mainContainerClass}>
        {state === "Home" && !userHasSpheres && (
          <VersionWithDisclaimerButton
            currentVersion={currentVersion}
            open={handleDisclaimer}
          />
        )}

        {showNav && (
          <Nav
            sideNavExpanded={sideNavExpanded}
            setSideNavExpanded={setSideNavExpanded}
          />
        )}

        {WrappedComponent}
      </main>
    </Flowbite>
  );
}

export default App;
