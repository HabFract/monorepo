import { CreateSphere, CreateOrbit, RefineOrbit } from "./components/forms";
import { ListOrbits, ListSpheres } from "./components/lists";
import PreloadAndCache from "./components/PreloadAllData";

import Home from "./components/layouts/Home";
import OrbitTree from "./components/vis/OrbitTree";
import { renderVis } from "./components/vis/helpers";

import { StateTransitions } from "./state/types/stateMachine";
import Settings from "./components/Settings";

export type AppState = // Currently just for routing in the state machine
  | "Home"
  | "Settings"
  | "PreloadAndCache"
  | "Onboarding1"
  | "Onboarding2"
  | "Onboarding3"
  | "Vis"
  | "CreateSphere"
  | "ListSpheres"
  | "CreateOrbit"
  | "ListOrbits";

export type Routes = {
  [key in AppState]: React.ReactNode;
};

export type AppStateStore = {
  currentState: AppState;
  params?: object;
  connection: any;
};

export const initialState: AppStateStore = {
  // Home route
  currentState: "Vis",
  params: {},
  connection: null,
};

export const routes: Routes = {
  Home: <Home />,
  Settings: <Settings version="" spheres={{} as any} />,
  PreloadAndCache: <PreloadAndCache />,
  Vis: (() => renderVis(OrbitTree))(),
  Onboarding1: <CreateSphere editMode={false} />,
  Onboarding2: (
    <CreateOrbit
      editMode={false}
      inModal={false}
      sphereEh={""}
      parentOrbitEh={undefined}
    />
  ),
  Onboarding3: <RefineOrbit refiningOrbitAh={""} />,
  CreateSphere: <CreateSphere headerDiv={<></>} editMode={false} />,
  ListSpheres: <ListSpheres />,
  CreateOrbit: (
    <CreateOrbit
      editMode={false}
      inModal={false}
      sphereEh=""
      parentOrbitEh=""
    />
  ),
  ListOrbits: <ListOrbits />,
};

const forms = ["CreateSphere", "CreateOrbit"] as any[];
const lists = ["ListSpheres", "ListOrbits"];

export const AppTransitions: StateTransitions<AppState> = {
  PreloadAndCache: ["Vis", "CreateSphere", "CreateOrbit"],
  Home: ["Settings", "Home", ...lists, ...forms, "Vis", "Onboarding1", "PreloadAndCache"],
  Settings: ["Home"],
  Onboarding1: ["Home", "Onboarding2"],
  Onboarding2: ["Onboarding1", "Onboarding2", "Onboarding3"],
  Onboarding3: ["Onboarding2", "Onboarding3", "Vis"],
  Vis: ["Home", ...forms, ...lists, "Vis", "PreloadAndCache"],
  CreateSphere: ["Home", ...lists, ...forms, "Vis"],
  ListSpheres: ["Home", ...lists, ...forms, "Vis", "PreloadAndCache"],
  CreateOrbit: ["Home", ...lists, ...forms, "Vis"],
  ListOrbits: ["Home", ...lists, ...forms, , "Vis", "PreloadAndCache"],
};
