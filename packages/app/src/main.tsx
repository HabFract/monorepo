import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StateMachine, StateTransitions } from './stateMachine.ts'
import CreateSphere from './components/forms/CreateSphere.tsx'
import { ListSpheres, ListOrbits }from './components/lists'
import { StateMachineContext } from './contexts/state-machine.ts'
import CreateOrbit from './components/forms/CreateOrbit.tsx'

const root = ReactDOM.createRoot(document.getElementById('root')!);

/*

Application State Management (Courtesy of Ada Burrows for hREA playspace)
============================

When the application loads there are several things which should happen in
succession and should be handled by a state machine.

* Make the connection to Holochain
* Set-up shared Holochain state information (from appInfo)
* Instantiate the DataStore and DataProviders
* Connect the signal handlers
* Fetch the root (or maybe the root.plan?)
* Display a list of available Plans, if any exist, or allow creating a plan
* Once a plan is selected or created, show the FlowCanvas UI.

There are other possibilities for the progression, for instance, we could create
a UI that allows creating Agents, ResourceSpecifications, ProcessSpecifications
and Plans that has a completely different screen to begin with.

*/

/**
 * Application States
 */
// export type AppState =
// | 'connecting'
// | 'setAppInfo'
// | 'createDataStore'
// | 'connectSignalHandlers'
// | 'fetchData'
// | 'loaded'
export type AppState = // Currently just for routing
| 'Home'
| 'CreateSphere'
| 'ListSpheres'
| 'CreateOrbit'
| 'ListOrbits'

/**
* Application State Transitions
*
* List of possible state transitions:
* 'currentState' => ['next', 'allowed', 'state']
*/
// const AppTransitions: StateTransitions<AppState> = {
// connecting: ['setAppInfo'],
// setAppInfo: ['createDataStore'],
// createDataStore: ['connectSignalHandlers'],
// connectSignalHandlers: ['fetchData'],
// fetchData: ['loaded'],
// loaded: ['loaded'],
// }
const AppTransitions: StateTransitions<AppState> = {
  Home: ['CreateSphere', 'ListSpheres'],
  CreateSphere: ['Home', 'ListSpheres'],
  ListSpheres: ['Home', 'CreateSphere', 'ListOrbits', 'CreateOrbit'],
  CreateOrbit: ['Home', 'ListOrbits'],
  ListOrbits: ['Home', 'CreateSphere', 'CreateOrbit'],
  }

/**
* Type of the state
*/
// export type AppStateStore = {
//   currentState: AppState
//   //  holochainClient: AppAgentWebsocket
//   appInfo: {}
//   //  dataStore: DataStore
// }
export type AppStateStore = {
  currentState: AppState
}

// const initialState: Partial<AppStateStore> = {
  // currentState: 'connecting',
  // holochainClient: undefined,
  // appInfo: undefined,
  // dataStore: undefined
// }
const initialState: AppStateStore = {
  currentState: 'Home',
}

// const AppMachine = new StateMachine<AppState, AppStateStore>(initialState, AppTransitions);
const AppMachine = new StateMachine<AppState, AppStateStore>(initialState, AppTransitions);

function renderComponent(component: React.ReactNode) {
  root.render(
    <React.StrictMode>
      <StateMachineContext.Provider value={AppMachine as any}>
        <App>
          {component}
        </App>
      </StateMachineContext.Provider>
    </React.StrictMode>,
  );
}

AppMachine.on('Home', (_state: AppStateStore) => {
  console.log('Home');
  root.render(
    <React.StrictMode>
      <StateMachineContext.Provider value={AppMachine as any}>
        <App>
          Welcome Home
        </App>
      </StateMachineContext.Provider>
    </React.StrictMode>,
  )
});

AppMachine.on('CreateSphere', (_state: AppStateStore) => {
  console.log('CreateSphere');
  renderComponent(<CreateSphere />);
  root.render(
    <React.StrictMode>
      <StateMachineContext.Provider value={AppMachine as any}>
        <App>
          <CreateSphere></CreateSphere>
        </App>
      </StateMachineContext.Provider>
    </React.StrictMode>,
  )
});

AppMachine.on('ListSpheres', async (_state: AppStateStore) => {
  console.log('ListSpheres route active');
  // Render ListSpheres component
  root.render(
    <React.StrictMode>
      <StateMachineContext.Provider value={AppMachine as any}>
        <App>
          <ListSpheres></ListSpheres>
        </App>
      </StateMachineContext.Provider>
    </React.StrictMode>,
  )
});

AppMachine.on('CreateOrbit', async (_state: AppStateStore) => {
  console.log('CreateOrbit route active');
  // Render CreateOrbit component
  root.render(
    <React.StrictMode>
      <StateMachineContext.Provider value={AppMachine as any}>
        <App>
          <CreateOrbit></CreateOrbit>
        </App>
      </StateMachineContext.Provider>
    </React.StrictMode>,
  )
});

AppMachine.on('ListOrbits', async (_state: AppStateStore) => {
  console.log('ListOrbits route active');
  // Render ListOrbits component
  root.render(
    <React.StrictMode>
      <StateMachineContext.Provider value={AppMachine as any}>
        <App>
          <ListOrbits></ListOrbits>
        </App>
      </StateMachineContext.Provider>
    </React.StrictMode>,
  )
});

AppMachine.go();
