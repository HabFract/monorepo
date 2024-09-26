import React from 'react'
import ReactDOM from 'react-dom/client'
import BootScreen from './BootScreen'
import 'broadcastchannel-polyfill'
import App from './App'
import { StateMachine } from './state/types/stateMachine'
import { AppState, AppStateStore, AppTransitions, initialState, routes } from './routes'
import { Provider } from 'jotai'
import { store } from './state/jotaiKeyValueStore'

/*
Application State Management (Courtesy of Ada Burrows for hREA playspace)
============================
*/
export const AppMachine = new StateMachine<AppState, AppStateStore>(initialState, AppTransitions);

Object.entries(routes).forEach(([routeName, component]) => {
  AppMachine.on(routeName as AppState, async (state: any) => {
    const ComponentWithProps = React.cloneElement(component as React.ReactElement, {
      ...state.params,
      key: JSON.stringify(state.params), // Use a unique key based on state.params to ensure Vis re-renders when sphere hash changes.
    });
    renderComponent(ComponentWithProps);
  });
});

const root = ReactDOM.createRoot(document.getElementById('root')!);

export async function renderComponent(component: React.ReactNode) {
  root.render(
    <React.StrictMode>
      <BootScreen>
        <App>
          {component}
        </App>
      </BootScreen>
    </React.StrictMode>,
  );
}

AppMachine.go();

export const WithCacheStore = (component: React.ReactNode) => {
  return (<Provider store={store}>
    {component}
  </Provider>)
};
