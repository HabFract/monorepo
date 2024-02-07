import { Component, ReactNode } from "react";
import { CreateProfile, CreateSphere, CreateOrbit } from "./components/forms";
import { ListOrbits, ListSpheres } from "./components/lists";
import { VisComponent, withVisCanvas } from "./components/vis/HOC/withVisCanvas";
import OrbitTree from "./components/vis/OrbitTree";
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

// Helper function to return a ReactNode that is a combination of the Vis component, wrapped by the withCanvas higher order component, contained by a mounting div
const renderVis = (visComponent: React.ComponentType<VisComponent>) : ReactNode => <div id="vis-root" className="h-full">{(withVisCanvas(visComponent))}</div>

export const routes: Routes = {
  Boot: <p>Loading</p>,
  Vis: renderVis(OrbitTree),
  Home: <p>Welcome Home</p>,
  Onboarding1: <CreateProfile editMode={false} />,
  Onboarding2: <CreateSphere editMode={false} />,
  Onboarding3: <CreateProfile editMode={false} />,
  Onboarding4: <CreateProfile editMode={false} />,
  CreateSphere: <CreateSphere editMode={false} />,
  ListSpheres: <ListSpheres />,
  CreateOrbit: <CreateOrbit editMode={false} />,
  ListOrbits: <ListOrbits />,
};

const forms = ['CreateSphere', 'CreateOrbit'] as any[];
const lists = ['ListSpheres', 'ListOrbits'];

export const AppTransitions: StateTransitions<AppState> = {
  Boot: ['Onboarding1'],
  Onboarding1: ['Home', 'Onboarding2'],
  Onboarding2: ['Onboarding1', 'Onboarding3'],
  Onboarding3: ['Onboarding2', 'Onboarding4'],
  Onboarding4: ['Onboarding3', 'Home'],

  Home: [...forms, ...lists, 'Vis'],
  Vis: ['Home', ...forms, ...lists],
  CreateSphere: ['Home', ...lists, ...forms, 'Vis'],
  ListSpheres: ['Home', ...lists, ...forms, 'Vis'],
  CreateOrbit: ['Home', ...lists, ...forms, 'Vis'],
  ListOrbits: ['Home', ...lists, ...forms,, 'Vis'],
}