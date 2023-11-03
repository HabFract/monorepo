import { aSphere, aHabit, anAgentProfile, aResponsePayload } from './graphql/generated/mocks';
import ButtonPage from './pages'
import './App.css'

import { MockedProvider } from '@apollo/client/testing';
import { SPHERES_MOCK } from './graphql/mocks/spheres';
const mocks = [
  SPHERES_MOCK,
  ORBITS_MOCK,
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
