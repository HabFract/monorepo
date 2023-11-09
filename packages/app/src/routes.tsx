import { CreateSphere, CreateOrbit } from "./components/forms";
import { ListOrbits, ListSpheres } from "./components/lists";
import { StateTransitions } from "./stateMachine";

export type AppState = // Currently just for routing in the state machine
  | 'Home'
  | 'CreateSphere'
  | 'ListSpheres'
  | 'CreateOrbit'
  | 'ListOrbits'

export type Routes = {
  [key in AppState]: React.ReactNode;
};

export type AppStateStore = {
  currentState: AppState
}

export const initialState: AppStateStore = { // Home route
  currentState: 'Home',
}

export const routes: Routes = {
  Home: <p>Welcome Home</p>,
  CreateSphere: <CreateSphere />,
  ListSpheres: <ListSpheres />,
  CreateOrbit: <CreateOrbit />,
  ListOrbits: <ListOrbits />,
};

export const AppTransitions: StateTransitions<AppState> = {
  Home: ['CreateSphere', 'ListSpheres'],
  CreateSphere: ['Home', 'ListSpheres'],
  ListSpheres: ['Home', 'CreateSphere', 'ListOrbits', 'CreateOrbit'],
  CreateOrbit: ['Home', 'ListOrbits'],
  ListOrbits: ['Home', 'CreateSphere', 'CreateOrbit', 'ListSpheres'],
  }