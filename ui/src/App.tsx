
import { useStateTransition } from './hooks/useStateTransition';

import Nav from './components/Nav';
import { Flowbite, Spinner } from 'flowbite-react';
import { cloneElement, useState } from 'react';

import BackCaret from './components/icons/BackCaret';
import Onboarding from './components/layouts/Onboarding';

import { Button, ProgressBar, darkTheme } from 'habit-fract-design-system';
import { store } from './state/jotaiKeyValueStore';
import { currentOrbitId, currentSphere } from './state/currentSphereHierarchyAtom';
import { useGetSpheresQuery } from './graphql/generated';

function App({ children: pageComponent }: any) {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(false); // Adds and removes expanded class to side-nav
  
  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  
  // Don't start at the home page for established users...
  const userHasSpheres = spheres?.spheres?.edges && spheres.spheres.edges.length > 0;
  state.match('Home') && userHasSpheres && transition('ListSpheres');
  
    return loadingSpheres
      ? <Spinner aria-label="Loading!"size="xl" className='full-spinner' />
      : (<Flowbite theme={{theme: darkTheme}}>
      {state.match('Onboarding')
        ? <main className={"page-container onboarding-page"}>
            <Onboarding>
              {pageComponent && cloneElement(pageComponent, {
                  headerDiv: (() => <>
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
                              : { orbitToEditId: orbit?.id }

                          return transition(getLastOnboardingState(state), { editMode: true, ...props })}}>
                      </Button>
                      <h1 className={"onboarding-title"}>Make a Positive Habit</h1>
                    </div>
                    <ProgressBar
                      stepNames={['Create Profile', 'Create Sphere', 'Create Orbit', 'Refine Orbit', 'Visualize']}
                      currentStep={+(state.match(/Onboarding(\d+)/)[1])}
                    />
                  </>)(),
                  submitBtn:
                    <Button
                      type={"onboarding"}
                      onClick={(e) => state.match("Onboarding3") ? transition(getNextOnboardingState(state), {sphereAh: store.get(currentSphere)?.actionHash}) : transition(getNextOnboardingState(state))}
                    >Save & Continue</Button>
              })}

            </Onboarding>
          </main>
        : <>
          {!state.match('Home') && <Nav transition={transition} sideNavExpanded={sideNavExpanded} setSideNavExpanded={setSideNavExpanded}></Nav>}
          <main className={state ? (() => getMainContainerClass(state))() : "page-container"}>
            {pageComponent && cloneElement(pageComponent, { startBtn:
                  state.match('Home') && <Button
                  type={"onboarding"}
                  onClick={() => { return transition("Onboarding1")}}>
                    Start Tracking Habits
                </Button>
              
            })}
          </main>
        </>
      }

    </Flowbite>
  )
}

function getMainContainerClass(state) {
  switch (state) {
    case 'Home':
      return "home page-container"
    case 'Vis':
      return "vis page-container"
    case 'CreateSphere':
      return "create-form page-container"
    case 'CreateOrbit':
      return "create-form page-container"
    case 'ListOrbits':
      return "list page-container"
    case 'ListSpheres':
      return "list page-container"
    default:
      return "page-container"
  }

}
export default App

function getLastOnboardingState(state: string) {
  if (state == 'Onboarding1') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) - 1}`
};
function getNextOnboardingState(state: string) {
  if (state == 'Onboarding3') return 'ListOrbits';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) + 1}`
};