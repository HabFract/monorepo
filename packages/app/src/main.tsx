import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StateMachine, StateTransitions } from './stateMachine.ts'
import CreateSphere from './components/CreateSphere.tsx'
import ListSpheres from './components/ListSpheres.tsx'
import { StateMachineContext } from './contexts/state-machine.ts'

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
| 'About'
| 'ListSpheres'

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
  Home: ['About', 'ListSpheres'],
  About: ['Home', 'ListSpheres'],
  ListSpheres: ['Home', 'About'],
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

AppMachine.on('Home', async (_state: AppStateStore) => {
  console.log('Home');
  // Render Home component
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

AppMachine.on('About', async (_state: AppStateStore) => {
  console.log('About');
  // Render About component
  root.render(
    <React.StrictMode>
      <StateMachineContext.Provider value={AppMachine as any}>
        <App>
          <p>HI</p>
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

AppMachine.go();