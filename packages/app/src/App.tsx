
import './App.css'

import { MockedProvider } from '@apollo/client/testing';
import { SPHERES_MOCKS } from './graphql/mocks/spheres';
import { useStateTransition } from './hooks/useStateTransition';

const mocks = [
  ...SPHERES_MOCKS,
  // ORBITS_MOCKS,
  // ...add other mocks here
];

function App({ children } : any) {
  const [state, transition] = useStateTransition();

  return (
    <>
      <nav>
        <button onClick={() => transition('Home')}>Home</button>
        <button onClick={() => transition('Contact')}>Contact</button>
        <button onClick={() => transition('About')}>About</button>
      </nav>
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    </>
  )
}

export default App
