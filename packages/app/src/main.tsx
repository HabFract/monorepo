import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StateMachine } from './stateMachine.ts'
import { StateMachineContext } from './contexts/state-machine.ts'
import { AppState, AppStateStore, AppTransitions, initialState, routes } from './routes.tsx'

/*

Application State Management (Courtesy of Ada Burrows for hREA playspace)
============================

*/

const AppMachine = new StateMachine<AppState, AppStateStore>(initialState, AppTransitions);

const root = ReactDOM.createRoot(document.getElementById('root')!);

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

Object.entries(routes).forEach(([routeName, component]) => {
  AppMachine.on(routeName as AppState, async (params) => {
    const ComponentWithProps = React.cloneElement(component as React.ReactElement, params);
    renderComponent(ComponentWithProps);
  });
});

AppMachine.go();
