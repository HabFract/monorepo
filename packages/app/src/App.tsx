
import './App.css'

import { Steps } from 'antd';

import { MockedProvider } from '@apollo/client/testing';
import { SPHERES_MOCKS } from './graphql/mocks/spheres';
import { ORBITS_MOCKS } from './graphql/mocks/orbits';

import { useStateTransition } from './hooks/useStateTransition';

import Nav from './components/Nav';

const mocks = [
  ...SPHERES_MOCKS,
  ...ORBITS_MOCKS,
  // ...add other mocks here
];

function App({ children: pageComponent }: any) {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  
  return (
    <>
      <MockedProvider mocks={mocks} addTypename={false}>
        { state.match('Onboarding')
          ? <>
            <main className={"page-container"}>{pageComponent}</main>
            <Steps
              current={state.match(/Onboarding(\d+)/)[1]}
              items={[
                {
                  title: 'Finished',
                },
                {
                  title: 'In Progress',
                },
                {
                  title: 'Waiting',
                },
              ]}
            />
          </>
          : <>
            <Nav transition={transition}></Nav>
            <main className={"page-container"}>{pageComponent}</main>
          </>
        }
      </MockedProvider>
    </>
  )
}

export default App
