import ButtonPage from './pages'
import './App.css'

import { MockedProvider } from '@apollo/client/testing';
import { SPHERES_MOCKS } from './graphql/mocks/spheres';
const mocks = [
  ...SPHERES_MOCKS,
  // ORBITS_MOCKS,
  // ...add other mocks here
];

function App() {

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <ButtonPage></ButtonPage>
    </MockedProvider>
  )
}

export default App
