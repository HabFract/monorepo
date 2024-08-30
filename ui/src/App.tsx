
import { useStateTransition } from './hooks/useStateTransition';

import Nav from './components/Nav';
import { Flowbite, Modal, Spinner } from 'flowbite-react';
import { cloneElement, ForwardedRef, forwardRef, ReactNode, RefObject, useEffect, useRef, useState } from 'react';

import BackCaret from './components/icons/BackCaret';
import Onboarding from './components/layouts/Onboarding';
import Settings from './components/Settings';
import Breadcrumbs from './components/Breadcrumbs';

import { Button, ProgressBar, darkTheme } from 'habit-fract-design-system';
import { nodeCache, SphereOrbitNodes, store } from './state/jotaiKeyValueStore';
import { currentOrbitId, currentSphere } from './state/currentSphereHierarchyAtom';
import { SphereConnection, useGetSpheresQuery } from './graphql/generated';
import { AppMachine } from './main';
import { getVersion } from '@tauri-apps/api/app';
import { ALPHA_RELEASE_DISCLAIMER, NODE_ENV } from './constants';

import { motion, AnimatePresence } from "framer-motion";
import { AlertOutlined } from '@ant-design/icons';
import { isSmallScreen } from './components/vis/helpers';
import { extractEdges } from './graphql/utils';
import Home from './components/layouts/Home';

function App({ children: pageComponent }: any) {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(false); // Adds and removes expanded class to side-nav
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Displays top level modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [mainContainerClass, setMainContainerClass] = useState<string>("page-container");
  useEffect(() => { // Apply main container class conditionally based on page
    setMainContainerClass(getMainContainerClassString(AppMachine.state.currentState))
  }, [AppMachine.state.currentState])

  const [currentVersion, setCurrentVersion] = useState<string>();
  useEffect(() => {
    if (NODE_ENV == 'dev') return
    getVersion().then(version => {
      setCurrentVersion(version)
    });
  }, [])

  const progressBarRef = useRef<HTMLDivElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);

  // Don't start at the home page for return users (those with at least one Sphere)
  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  const userHasSpheres = spheres?.spheres?.edges && spheres.spheres.edges.length > 0;

  function withPageTransition(page: ReactNode) {
    return (
      <AnimatePresence mode='wait'>
        <motion.div
          className='framer-motion'
          key={+(new Date)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {page}
        </motion.div>
      </AnimatePresence>
    )
  }
  function withLayout(component: ReactNode) {
    const sphere = store.get(currentSphere);
    const orbit = store.get(currentOrbitId);
    const sphereNodes = sphere?.actionHash && store.get(nodeCache.items) && store.get(nodeCache.items)![sphere.actionHash] as SphereOrbitNodes;
    const currentSphereDetails = userHasSpheres && extractEdges(spheres.spheres).find(possibleSphere => possibleSphere.id == sphere.actionHash);

    switch (true) {
      case !!(state.match("Onboarding")):
        return <Onboarding>
          {withPageTransition(component)}
        </Onboarding>;
      case ["Home", "PreloadAndCache"].includes(state):
        if(state == "Home" && typeof sphereNodes == 'object' && (Object.values(sphereNodes as object).length > 0)) {
          return <Home firstVisit={false}></Home>
        }
        return withPageTransition(component)
      default:
        return <div className='p-1 w-full'>
          <Breadcrumbs state={AppMachine.state.currentState} transition={transition} currentSphere={currentSphereDetails}></Breadcrumbs>
          {component}
        </div>
    }
  }

  // Perform scrolling of progress bar on onboarding.
  useEffect(() => {
    const stage = +(state.match(/Onboarding(\d+)/)?.[1]);
    if(!stage || progressBarRef.current == null) return;
    setTimeout(() => {
      (progressBarRef.current as any).querySelector(".onboarding-progress").scrollTo(stage * 130,0)
    }, 500);
  }, [progressBarRef.current]);

  // Perform reset of vertical scroll bar on onboarding.
  useEffect(() => {
    if(mainPageRef.current == null) return;
    setTimeout(() => {
      (mainPageRef.current as any)?.querySelector(".onboarding-layout")?.scrollTo(0,0);
    }, 500);
  }, [progressBarRef.current]);
  
  const OnboardingHeader = forwardRef((_props, ref: ForwardedRef<HTMLDivElement>) => {
    if (!state.match("Onboarding")) return <></>
  
    return <>
      <div className={"flex w-full justify-between gap-2"}>
        <Button
          type={"icon"}
          icon={<BackCaret />}
          onClick={() => {
            const sphere = store.get(currentSphere);
            const orbit = store.get(currentOrbitId);
            const props = getLastOnboardingState(state).match("Onboarding1")
              ? { sphereToEditId: sphere?.actionHash }
              : getLastOnboardingState(state).match("Onboarding2")
                ? { sphereEh: sphere.entryHash, orbitToEditId: orbit?.id }
                : { orbitToEditId: orbit?.id };
  
            return transition(getLastOnboardingState(state), { editMode: true, ...props });
          }}>
        </Button>
        <h1 className={"onboarding-title"}>Make a Positive Habit</h1>
      </div>
      <div ref={ref}>
        <ProgressBar
          stepNames={['Create Profile', 'Create Sphere', 'Create Orbit', 'Refine Orbit', 'Visualize']}
          currentStep={+(state.match(/Onboarding(\d+)/)?.[1])} />
      </div>
    </>;
  });

  return <Flowbite theme={{ theme: darkTheme }}>
    <main ref={mainPageRef} className={mainContainerClass}>
      {/* Version and alpha status disclaimer */}
      {state == 'Home' && !userHasSpheres && VersionDisclaimer(currentVersion, () => setIsModalOpen(true), true)}
      {/* Return users can see a Nav */}
      {userHasSpheres && !((isSmallScreen() && ['CreateSphere','ListSpheres','CreateOrbit','ListOrbits'].includes(state)) || state.match('Onboarding'))
        && <Nav transition={transition} sideNavExpanded={sideNavExpanded} setSettingsOpen={() => { setIsModalOpen(true); setIsSettingsOpen(true) }} setSideNavExpanded={setSideNavExpanded}></Nav>
      }

      {loadingSpheres
        ? <Spinner aria-label="Loading!" size="xl" className='full-spinner' />
        : pageComponent && withLayout(cloneElement(pageComponent, {
          // Only Renders when state == "Home"
          startBtn: HomeContinue(state, transition),
          // Only Renders when state includes "Onboarding"
          headerDiv: <OnboardingHeader ref={progressBarRef}/>,
          submitBtn: OnboardingContinue(state, transition)
        }
        ))
      }
    </main>
    <Modal show={isModalOpen} onClose={() => { setIsSettingsOpen(false); setIsModalOpen(false) }}>
      <Modal.Header>
        {isSettingsOpen ? "Settings" : "Disclaimer:"}
      </Modal.Header>
      <Modal.Body>
        {isSettingsOpen ? <Settings version={currentVersion} spheres={spheres?.spheres as SphereConnection} setIsModalOpen={setIsModalOpen} setSettingsOpen={setIsSettingsOpen} /> : <p className='disclaimer'>{ALPHA_RELEASE_DISCLAIMER}</p>}
      </Modal.Body>
    </Modal>
  </Flowbite>
}

export function VersionDisclaimer(currentVersion: string | undefined, open: Function, isFrontPage?: boolean): ReactNode {
  return <div className={isFrontPage ? "app-version-disclaimer z-100 flex gap-2 fixed right-1 top-1" : "app-version-disclaimer z-60 flex gap-2 fixed right-1 bottom-1"}>
    {NODE_ENV !== 'dev' && <div className='version-number'>v{currentVersion}</div>}
    <Button type={"secondary"} onClick={() => { open() }}>{isSmallScreen() ? <AlertOutlined className="text-bg" /> : "Disclaimer"}</Button>
  </div>;
}

function HomeContinue(state: any, transition: any): any {
  return state.match('Home') && <Button
    type={"onboarding"}
    onClick={() => { return transition("Onboarding1"); }}>
    Start Tracking Habits
  </Button>;
}

function OnboardingContinue(state: any, transition: any) {
  return <Button
    loading={false}
    type={"onboarding"}
    onClick={(_e) => {
      return state.match("Onboarding3") ? transition(getNextOnboardingState(state)) : transition(getNextOnboardingState(state));
    }}>Save & Continue</Button>;
}

function getMainContainerClassString(state) {
  switch (state) {
    case 'Home':
      return "home page-container"
    case 'Vis':
      return "vis page-container"
    case 'CreateSphere':
      return "create-form page-container form-container"
    case 'CreateOrbit':
      return "create-form page-container form-container"
    case 'ListOrbits':
      return "list page-container"
    case 'ListSpheres':
      return "list page-container"
    case 'Onboarding1':
      return "onboarding page-container"
    case 'Onboarding2':
      return "onboarding page-container"
    case 'Onboarding3':
      return "onboarding page-container"
    default:
      return "page-container"
  }

}

function getLastOnboardingState(state: string) {
  if (state == 'Onboarding1') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) - 1}`
};
function getNextOnboardingState(state: string) {
  if (state == 'Onboarding3') return 'PreloadAndCache';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) + 1}`
};

export default App