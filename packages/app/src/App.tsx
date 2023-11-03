import CreateSphere from './components/CreateSphere';
import ListSpheres from './components/ListSpheres';
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
      <CreateSphere />
      <ListSpheres />
    </MockedProvider>
  )
}

export default App
