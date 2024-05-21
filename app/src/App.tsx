
import './App.css'

import { useStateTransition } from './hooks/useStateTransition';

import Nav from './components/Nav';
import { Flowbite } from 'flowbite-react';
import { cloneElement, useState } from 'react';

import BackCaret from './components/icons/BackCaret';
import Onboarding from './components/layouts/Onboarding';

import { Button, ProgressBar, darkTheme } from 'habit-fract-design-system';
import 'habit-fract-design-system/dist/style.css';
import { decode } from '@msgpack/msgpack';

function App({ children: pageComponent }: any) {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(false); // Adds and removes expanded class to side-nav

  return (
    <Flowbite theme={{theme: darkTheme}}>
      {state.match('Onboarding')
        ? <main className={"page-container onboarding-page"}>
            <Onboarding>
              {cloneElement(pageComponent, {
                children: cloneElement(pageComponent.props.children, {
                  headerDiv: (() => <>
                    <div className={"flex w-full justify-between gap-2"}>
                      <Button
                        type={"icon"}
                        icon={<BackCaret />}
                        onClick={() => { return transition(getLastOnboardingState(state), { editMode: true })}}>
                      </Button>
                      <h1 className={"onboarding-title"}>Break a Negative Habit</h1>
                    </div>
                    <ProgressBar
                      stepNames={['Create Profile', 'Create A Sphere', 'Create An Orbit', 'Confirm Orbit', 'Visualize']}
                      currentStep={+(state.match(/Onboarding(\d+)/)[1])}
                    />
                  </>)(),
                  submitBtn:
                    <Button
                      type={"onboarding"}
                      onClick={(e) => console.log(e)}
                    >Save & Continue</Button>
                })
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

function getLastOnboardingState(state: string) {
  if (state == 'Onboarding1') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) - 1}`
};
function getNextOnboardingState(state: string) {
  if (state == 'Onboarding4') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) + 1}`
};