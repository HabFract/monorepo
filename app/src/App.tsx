
import './App.css'

import { Steps, Button } from 'antd';

import { useStateTransition } from './hooks/useStateTransition';

import Nav from './components/Nav';
import { CustomFlowbiteTheme, Flowbite } from 'flowbite-react';
import { useState } from 'react';

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

  const customTheme: CustomFlowbiteTheme = {
    label: {
      root: {
        base: "text-base font-sans font-semibold tracking-wide leading-[1.5rem] flex items-center gap-2",
        colors: {
          default: "text-title",
          disabled: "text-slate-50",
        }
      }
    },
    dropdown: {
      content: "",
      inlineWrapper: "bg-primary text-base font-sans font-semibold tracking-wide leading-[1.5rem] flex items-center gap-2"
    },
    textInput: {
      field: {
        input: {
          colors: {
            default: "text-base font-normal bg-slate-800 hover:bg-slate-700 text-title border-slate-500 border-2 focus:border-transparent focus:outline-link focus:outline-offset-2 focus:outline-2 focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
            valid: "dark:bg-secondary ",
            invalid: "dark:bg-secondary ",
            disabled: "text-base font-normal bg-slate-800 hover:bg-slate-800 text-title border-slate-500 border-2 focus:border-transparent focus:outline-link focus:outline-offset-2 focus:outline-2 focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
          }
        }
      }
    },
    textarea: {
      colors: {
        default: "p-4 text-base font-normal bg-slate-800 hover:bg-slate-700 text-title border-slate-500 border-2 focus:border-transparent  focus:outline-link focus:outline-offset-2 focus:outline-2 focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
      }
    },
    select: {
      field: {
        select: {
          colors: {
            default: "p-4 text-base font-normal bg-slate-800 hover:bg-slate-700 text-title border-slate-500 border-2 focus:border-transparent  focus:outline-link focus:outline-offset-2 focus:outline-2 focus:shadow-[0_35px_60px_-15px_rgba(0,0,0,0)] focus:ring-0",
          }
        }
      }
    },
    tooltip: {
      style: {
        dark: "bg-white"
      }
    },
    modal: {
      header: {
        title: 'text-2xl text-title font-heading font-base tracking-wider leading-[1.5rem]'
      },
      content: {
        inner: 'border-2 border-title bg-slate-900 rounded-xl text-base text-title'
      },
    },

  };

  return (
    <Flowbite theme={{ theme: customTheme }}>
      {state.match('Onboarding')
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
          <Nav transition={transition} sideNavExpanded={sideNavExpanded} setSideNavExpanded={setSideNavExpanded} ></Nav>
          <main className={"page-container"}>{pageComponent}</main>
        </>
      }

    </Flowbite>
  )
}

export default App
