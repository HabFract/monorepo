
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
console.log('decode() :>> ', decode([129, 162, 105, 100, 217, 72, 117, 100, 87, 104, 68, 97, 50, 116, 104, 81, 87, 78, 72, 83, 70, 82, 70, 99, 49, 74, 72, 87, 70, 77, 48, 77, 85, 82, 104, 101, 69, 86, 69, 82, 70, 104, 80, 97, 86, 74, 111, 79, 84, 70, 85, 81, 50, 49, 110, 76, 86, 69, 116, 81, 51, 104, 52, 98, 87, 107, 50, 84, 110, 69, 50, 88, 48, 74, 73, 78, 49, 99] ));
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
                      onClick={(e) => console.log(e)}>Save & Continue</Button>
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