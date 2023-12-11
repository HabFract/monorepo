import { CreateProfile, CreateSphere, CreateOrbit } from "./components/forms";
import { ListOrbits, ListSpheres } from "./components/lists";
import { StateTransitions } from "./stateMachine";

export type AppState = // Currently just for routing in the state machine
  | 'Onboarding:NoProfile'
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
  currentState: "Onboarding:NoProfile",
  params: {}
}

export const routes: Routes = {
  Home: <p>Welcome Home</p>,
  CreateSphere: <CreateSphere />,
  ["Onboarding:NoProfile"]: <CreateProfile />,
  ListSpheres: <ListSpheres />,
  CreateOrbit: <CreateOrbit />,
  ListOrbits: <ListOrbits />,
};

export const AppTransitions: StateTransitions<AppState> = {
  ["Onboarding:NoProfile"]: ['Home', 'ListSpheres'],
  Home: ['CreateSphere', 'ListSpheres', 'ListOrbits', 'CreateOrbit'],
  CreateSphere: ['Home', 'ListSpheres'],
  ListSpheres: ['Home', 'CreateSphere', 'ListOrbits', 'CreateOrbit'],
  CreateOrbit: ['Home', 'ListOrbits', 'CreateOrbit'],
  ListOrbits: ['Home', 'CreateSphere', 'CreateOrbit', 'ListSpheres', 'ListOrbits'],
  }