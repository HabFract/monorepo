
import { useStateTransition } from './hooks/useStateTransition';
import withLayout from './components/vis/HOC/withLayout';

import Nav from './components/navigation/Nav';
import { Flowbite, Modal, Spinner } from 'flowbite-react';
import { cloneElement, useRef, useState } from 'react';

import Settings from './components/Settings';

import { darkTheme } from 'habit-fract-design-system';
import { store } from './state/jotaiKeyValueStore';
import { currentOrbitId, currentSphere } from './state/currentSphereHierarchyAtom';
import { SphereConnection, useGetSpheresQuery } from './graphql/generated';
import { ALPHA_RELEASE_DISCLAIMER } from './constants';

import { isSmallScreen } from './components/vis/helpers';
import { extractEdges } from './graphql/utils';
import OnboardingHeader, { getNextOnboardingState } from './components/header/OnboardingHeader';
import VersionWithDisclaimerButton from './components/home/VersionWithDisclaimerButton';
import { useOnboardingScroll } from './hooks/useOnboardingScroll';
import { useMainContainerClass } from './hooks/useMainContainerClass';
import { useCurrentVersion } from './hooks/useCurrentVersion';
import OnboardingContinue from './components/forms/buttons/OnboardingContinueButton';
import HomeContinue from './components/home/HomeContinueButton';

function App({ children: pageComponent }) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing

  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(false); // Adds and removes expanded class to side-nav
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Displays top level modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const mainContainerClass = useMainContainerClass();
  const currentVersion = useCurrentVersion();
  
  // Allow auto scrolling back to top of onboarding stages/to relevant progress step
  const progressBarRef = useRef<HTMLDivElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);
  useOnboardingScroll(state, progressBarRef, mainPageRef);

  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  const userHasSpheres = spheres?.spheres?.edges && spheres.spheres.edges.length > 0;

  const sphere = store.get(currentSphere);
  const currentSphereDetails = userHasSpheres && extractEdges(spheres.spheres).find(possibleSphere => possibleSphere.id == sphere.actionHash);

  return <Flowbite theme={{ theme: darkTheme }}>
    <main ref={mainPageRef} className={mainContainerClass}>
      {/* Version and alpha status disclaimer */}
      {state == 'Home' && !userHasSpheres && <VersionWithDisclaimerButton currentVersion={currentVersion} open={() => setIsModalOpen(true)} isFrontPage={true} />}
      {/* Return users can see a side Nav on certain pages */}
      {userHasSpheres && !((isSmallScreen() && ['CreateSphere', 'ListSpheres', 'CreateOrbit', 'ListOrbits'].includes(state)) || state.match('Onboarding'))
        && <Nav transition={transition} sideNavExpanded={sideNavExpanded} setSettingsOpen={() => { setIsModalOpen(true); setIsSettingsOpen(true) }} setSideNavExpanded={setSideNavExpanded}></Nav>
      }

      {loadingSpheres
        ? <Spinner aria-label="Loading!" size="xl" className='full-spinner' />
        : pageComponent && withLayout(cloneElement(pageComponent, {
          // Only Renders when state == "Home"
          startBtn: state.match('Home') ? <HomeContinue onClick={() => transition("Onboarding1")} /> : <></>,
          // Only Renders when state includes "Onboarding"
          headerDiv: <OnboardingHeader state={state} transition={transition} ref={progressBarRef} />,
          submitBtn: <OnboardingContinue onClick={() => transition(getNextOnboardingState(state))} />
        }
        ), state, transition, params)({currentSphereDetails, newUser: !!userHasSpheres})
      }
    </main>
    <Modal dismissible show={isModalOpen} onClose={() => { setIsSettingsOpen(false); setIsModalOpen(false) }}>
      <Modal.Header>
        {isSettingsOpen ? "Settings" : "Disclaimer:"}
      </Modal.Header>
      <Modal.Body>
        {isSettingsOpen ? <Settings version={currentVersion || ""} spheres={spheres?.spheres as SphereConnection} setIsModalOpen={setIsModalOpen} setIsSettingsOpen={setIsSettingsOpen} /> : <p className='disclaimer'>{ALPHA_RELEASE_DISCLAIMER}</p>}
      </Modal.Body>
    </Modal>
  </Flowbite>
}

export default App