import { CreateProfile, CreateSphere, CreateOrbit } from "./components/forms";
import { ListOrbits, ListSpheres } from "./components/lists";
import { withVis } from "./components/vis/HOC/withVis";
import OrbitTree from "./components/vis/OrbitTree";
import { StateTransitions } from "./stateMachine";

export type AppState = // Currently just for routing in the state machine
  | 'Boot'
  | 'Onboarding1'
  | 'Onboarding2'
  | 'Onboarding3'
  | 'Onboarding4'
  | 'Home'
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
  currentState: "Boot",
  params: {}
}

export const routes: Routes = {
  Boot: <>{withVis(OrbitTree)}</>, //<p>Connecting...</p>,
  Home: <p>Welcome Home</p>,
  Onboarding1: <CreateProfile editMode={false} />,
  Onboarding2: <CreateSphere />,
  Onboarding3: <CreateOrbit />,
  Onboarding4: <CreateOrbit />,
  CreateSphere: <CreateSphere />,
  ListSpheres: <ListSpheres />,
  CreateOrbit: <CreateOrbit />,
  ListOrbits: <ListOrbits />,
};

export const AppTransitions: StateTransitions<AppState> = {
  Boot: ['Onboarding1'],
  Onboarding1: ['Home', 'Onboarding2'],
  Onboarding2: ['Onboarding1', 'Onboarding3'],
  Onboarding3: ['Onboarding2', 'Onboarding4'],
  Onboarding4: ['Onboarding3', 'Home'],
  Home: ['CreateSphere', 'ListSpheres', 'ListOrbits', 'CreateOrbit'],
  CreateSphere: ['Home', 'ListSpheres'],
  ListSpheres: ['Home', 'CreateSphere', 'ListOrbits', 'CreateOrbit'],
  CreateOrbit: ['Home', 'ListOrbits', 'CreateOrbit'],
  ListOrbits: ['Home', 'CreateSphere', 'CreateOrbit', 'ListSpheres', 'ListOrbits'],
  }