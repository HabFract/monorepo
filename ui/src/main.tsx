import React from 'react'
import ReactDOM from 'react-dom/client'
import BootScreen from './BootScreen'
import App from './App'
import { StateMachine } from './state/stateMachine'
import { AppState, AppStateStore, AppTransitions, initialState, routes } from './routes'
import { Provider } from 'jotai'
import { store } from './state/jotaiKeyValueStore'
import { getConnection } from './graphql/connection'
import { initGraphQLClient } from './graphql/client'

/*

Application State Management (Courtesy of Ada Burrows for hREA playspace)
============================

*/

export const WithCacheStore = (component: React.ReactNode) => {
  return (<Provider store={store}>
    {component}
  </Provider>)
};

export const AppMachine = new StateMachine<AppState, AppStateStore>(initialState, AppTransitions);

Object.entries(routes).forEach(([routeName, component]) => {
  AppMachine.on(routeName as AppState, async (state: any) => {
    const ComponentWithProps = React.cloneElement(component as React.ReactElement, state.params);
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

export const client = async() => {
  const conn = await getConnection("habit_fract");
  // TODO: return apollo client for use outside components
  // return await initGraphQLClient(conn.client)
}


