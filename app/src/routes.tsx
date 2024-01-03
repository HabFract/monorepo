import { CreateProfile, CreateSphere, CreateOrbit } from "./components/forms";
import { ListOrbits, ListSpheres } from "./components/lists";
import { withVisCanvas } from "./components/vis/HOC/withVisCanvas";
import OrbitTree from "./components/vis/OrbitTree";
import { StateTransitions } from "./stateMachine";

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
  Vis: withVisCanvas(OrbitTree),
  Home: <p>Welcome Home</p>,
  Onboarding1: <CreateProfile editMode={false} />,
  Onboarding2: <CreateSphere />,
  Onboarding3: <CreateProfile editMode={false} />,
  Onboarding4: <CreateProfile editMode={false} />,
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
  Home: ['CreateSphere', 'ListSpheres', 'ListOrbits', 'CreateOrbit', 'Vis'],
  Vis: ['Home', 'CreateSphere', 'ListSpheres', 'ListOrbits', 'CreateOrbit'],
  CreateSphere: ['Home', 'ListSpheres', 'CreateOrbit', 'Vis'],
  ListSpheres: ['Home', 'CreateSphere', 'ListOrbits', 'CreateOrbit', 'Vis'],
  CreateOrbit: ['Home', 'ListOrbits', 'CreateOrbit', 'Vis'],
  ListOrbits: ['Home', 'CreateSphere', 'CreateOrbit', 'ListSpheres', 'ListOrbits', 'Vis'],
  }