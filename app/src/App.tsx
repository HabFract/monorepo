
import './App.css'

import { Steps, Button } from 'antd';

import { useStateTransition } from './hooks/useStateTransition';

import Nav from './components/Nav';

function getLastOnboardingState(state: string) {
  if(state == 'Onboarding1') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) - 1}`
};
function getNextOnboardingState(state: string) {
  if(state == 'Onboarding4') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) + 1}`
};

function App({ children: pageComponent }: any) {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  
  return (
    <>
        { state.match('Onboarding')
          ? <>
            <Button 
              className={"fixed top-0 left-0 z-20 text-white"} onClick={() => transition(getLastOnboardingState(state))}>BACK</Button>
            <main className={"page-container onboarding-page"}>{pageComponent}</main>
            <Steps
              className={"onboarding-progress"}
              direction={'horizontal'}
              current={state.match(/Onboarding(\d+)/)[1]}
              items={[
                {
                  subTitle: 'Profile',
                },
                {
                  subTitle: 'Sphere',
                },
                {
                  subTitle: 'Orbit',
                },
                {
                  subTitle: 'Visualise',
                },
              ]}
            />

            <Button 
              className={"fixed top-0 right-0 z-20 text-white"} onClick={() => transition(getNextOnboardingState(state))}>NEXT</Button>
          </>
          : <>
            <Nav transition={transition}></Nav>
            <main className={"page-container"}>{pageComponent}</main>
          </>
        }
        
    </>
  )
}

export default App
