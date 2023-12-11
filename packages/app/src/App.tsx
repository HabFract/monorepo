
import './App.css'

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
          ? pageComponent
          : <Nav transition={transition}>
            {pageComponent}
          </Nav>
        }
      </MockedProvider>
    </>
  )
}

export default App
