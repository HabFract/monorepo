import { CreateProfile, CreateSphere, CreateOrbit, RefineOrbit } from "./components/forms";
import { ListOrbits, ListSpheres } from "./components/lists";
import PreloadOrbitData from "./components/Preload";

import Home from "./components/layouts/Home";
import OrbitTree from "./components/vis/OrbitTree";
import { renderVis } from "./components/vis/helpers";
import { StateTransitions } from "./state/stateMachine";
import { Spinner } from "flowbite-react";

export type AppState = // Currently just for routing in the state machine
  | 'Boot'
  | 'PreloadAndCache'
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
  params?: object,
  client: any
}

export const initialState: AppStateStore = { // Home route
  currentState: "Home",
  params: {},
  client: null
}

export const routes: Routes = {
  Boot: <Spinner aria-label="Loading!"size="xl" className="absolute top-1/2 bottom-1/2" />,
  PreloadAndCache: <PreloadOrbitData />,
  Vis: renderVis(OrbitTree),
  Home: <Home />,
  Onboarding1: <CreateSphere editMode={false} />,
  Onboarding2: <CreateOrbit editMode={false} />,
  Onboarding3: <RefineOrbit />,
  CreateSphere: <CreateSphere headerDiv={<></>} editMode={false} />,
  ListSpheres: <ListSpheres />,
  CreateOrbit: <CreateOrbit headerDiv={<></>} editMode={false} inModal={false} sphereEh="" parentOrbitEh="" />,
  ListOrbits: <ListOrbits />,
};

const forms = ['CreateSphere', 'CreateOrbit'] as any[];
const lists = ['ListSpheres', 'ListOrbits'];

export const AppTransitions: StateTransitions<AppState> = {
  Boot: ['Home'],
  PreloadAndCache: ['Vis', 'CreateSphere', 'PreloadAndCache'],
  Home: [ "Onboarding1", "PreloadAndCache"],
  Onboarding1: ['Home', 'Onboarding2'],
  Onboarding2: ['Onboarding1', 'Onboarding2', 'Onboarding3'],
  Onboarding3: ['Onboarding2', 'Onboarding3', 'Onboarding4', 'PreloadAndCache'],
  Onboarding4: ['Onboarding3', 'Home'],

  Vis: ['Home', ...forms, ...lists, 'Vis'],
  CreateSphere: ['Home', ...lists, ...forms, 'Vis'],
  ListSpheres: ['Home', ...lists, ...forms, 'Vis'],
  CreateOrbit: ['Home', ...lists, ...forms, 'Vis'],
  ListOrbits: ['Home', ...lists, ...forms,, 'Vis'],
}