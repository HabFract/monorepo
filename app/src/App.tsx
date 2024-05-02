
import './App.css'

import { useStateTransition } from './hooks/useStateTransition';

import ProgressBar from '../../design-system/onboarding/ProgressBar';
import Button from '../../design-system/buttons/Button';
import Nav from './components/Nav';
import { CustomFlowbiteTheme, Flowbite } from 'flowbite-react';
import { cloneElement, useState } from 'react';
import BackCaret from './components/icons/BackCaret';
import Onboarding from './components/layouts/Onboarding';
import darkTheme from '../../design-system/darkTheme';

function getLastOnboardingState(state: string) {
  if (state == 'Onboarding1') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) - 1}`
};
function getNextOnboardingState(state: string) {
  if (state == 'Onboarding4') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) + 1}`
};

function App({ children: pageComponent }: any) {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(false); // Adds and removes expanded class to side-nav

  return (
    <Flowbite>
      {state.match('Onboarding')
        ? <main className={"page-container onboarding-page"}>
          <Onboarding stage={state.match(/Onboarding(\d+)/)[1]}>
            <div className={"flex w-full justify-between gap-2"}>
              <Button
                type={"icon"}
                icon={<BackCaret />}
                onClick={() => transition(getLastOnboardingState(state))}>
              </Button>
              <h1 className={"onboarding-title"}>Break a Negative Habit</h1>
            </div>

            <ProgressBar
              stepNames={['Create Profile', 'Create A Sphere', 'Create An Orbit', 'Confirm Orbit', 'Visualize']}
              currentStep={state.match(/Onboarding(\d+)/)[1]}
            />

            {cloneElement(pageComponent, {
              children: [cloneElement(pageComponent.props.children, {
                submitBtn:
                  <Button
                    type={"onboarding"}
                    onClick={() => transition(getNextOnboardingState(state))}>Save & Continue</Button>
              })]
            })}

          </Onboarding>
        </main>
        : <>
          <Nav transition={transition} sideNavExpanded={sideNavExpanded} setSideNavExpanded={setSideNavExpanded}></Nav>
          <main className={"page-container"}>{pageComponent}</main>
        </>
      }

    </Flowbite>
  )
}

export default App
