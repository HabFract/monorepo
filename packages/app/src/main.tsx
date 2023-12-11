import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StateMachine } from './stateMachine.ts'
import { StateMachineContext } from './contexts/state-machine.ts'
import { MyProfileProvider } from './contexts/myProfile.tsx'
import { AppState, AppStateStore, AppTransitions, initialState, routes } from './routes.tsx'

/*

Application State Management (Courtesy of Ada Burrows for hREA playspace)
============================

*/

export const AppMachine = new StateMachine<AppState, AppStateStore>(initialState, AppTransitions);

const root = ReactDOM.createRoot(document.getElementById('root')!);

function renderComponent(component: React.ReactNode) {
  root.render(
    <React.StrictMode>
      <MyProfileProvider>
        <StateMachineContext.Provider value={AppMachine as any}>
          <App>
            {component}
          </App>
        </StateMachineContext.Provider>
      </MyProfileProvider>
    </React.StrictMode>,
  );
}

Object.entries(routes).forEach(([routeName, component]) => {
  AppMachine.on(routeName as AppState, async (state) => {
    const ComponentWithProps = React.cloneElement(component as React.ReactElement, state.params);
    renderComponent(ComponentWithProps);
  });
});

AppMachine.go();
