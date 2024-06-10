import { CreateProfile, CreateSphere, CreateOrbit, RefineOrbit } from "./components/forms";
import { ListOrbits, ListSpheres } from "./components/lists";

import Home from "./components/layouts/Home";
import OrbitTree from "./components/vis/OrbitTree";
import { renderVis } from "./components/vis/helpers";
import { StateTransitions } from "./state/stateMachine";

export type AppState = // Currently just for routing in the state machine
  | 'Boot'
  | 'Onboarding1'
  | 'Onboarding2'
  | 'Onboarding3'
  | 'Onboarding4'
  | 'Home'
  | 'Vis'
  | 'CreateSphere'
  | 'ListSpheres'
  | 'CreateOrbit'
  | 'ListOrbits'

export type Routes = {
  [key in AppState]: React.ReactNode;
};

export type AppStateStore = {
  currentState: AppState,
  params?: object
}

export const initialState: AppStateStore = { // Home route
  currentState: "Home",
  params: {}
}

export const routes: Routes = {
  Boot: <p>Loading</p>,
  Vis: renderVis(OrbitTree),
  Home: <Home />,
  Onboarding1: <CreateSphere editMode={false} />,
  Onboarding2: <CreateOrbit editMode={false} />,
  Onboarding3: <RefineOrbit />,
  Onboarding4: <CreateProfile editMode={false} />,
  CreateSphere: <CreateSphere headerDiv={<h1 className="w-full text-center">Create a Sphere</h1>} editMode={false} />,
  ListSpheres: <ListSpheres />,
  CreateOrbit: <CreateOrbit headerDiv={<h1 className="w-full text-center">Create an Orbit</h1>} editMode={false} inModal={false} sphereEh="" parentOrbitEh="" />,
  ListOrbits: <ListOrbits />,
};

const forms = ['CreateSphere', 'CreateOrbit'] as any[];
const lists = ['ListSpheres', 'ListOrbits'];

export const AppTransitions: StateTransitions<AppState> = {
  Boot: ['Home'],
  Home: [ "Onboarding1"],
  Onboarding1: ['Home', 'Onboarding2'],
  Onboarding2: ['Onboarding1', 'Onboarding2', 'Onboarding3'],
  Onboarding3: ['Onboarding2', 'Onboarding4'],
  Onboarding4: ['Onboarding3', 'Home'],

  Vis: ['Home', ...forms, ...lists, 'Vis'],
  CreateSphere: ['Home', ...lists, ...forms, 'Vis'],
  ListSpheres: ['Home', ...lists, ...forms, 'Vis'],
  CreateOrbit: ['Home', ...lists, ...forms, 'Vis'],
  ListOrbits: ['Home', ...lists, ...forms,, 'Vis'],
}