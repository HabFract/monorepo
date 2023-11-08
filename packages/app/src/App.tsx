
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

function App({ children: pageComponent } : any) {
  const [_, transition] = useStateTransition();

  return (
    <>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Nav transition={transition}>
          {pageComponent}
        </Nav>
      </MockedProvider>
    </>
  )
}

export default App
