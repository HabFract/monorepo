import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StateMachine } from './stateMachine.ts'
import { StateMachineContext } from './contexts/state-machine.ts'
import { ApolloProvider } from '@apollo/client'
import { MyProfileProvider } from './contexts/myProfile.tsx'
import { AppState, AppStateStore, AppTransitions, initialState, routes } from './routes.tsx'
import connect, { ClientOptions } from './graphql/client.ts'
window._p = function customLog(message, objs, color = "black") {
  switch (color) {
    case "success":
      color = "Green";
      break;
    case "!":
      color = "pink";
      break;
    case "info":
      color = "Blue";
      break;
    case "error":
      color = "Red";
      break;
    case "warning":
      color = "Orange";
      break;
    default:
      color = color;
  }
  if (!import.meta.env.PROD) {
    console.log(`%c${message}`, `color:${color}`);
    typeof objs == "object" && console.table(objs);
  }
};
/*

Application State Management (Courtesy of Ada Burrows for hREA playspace)
============================

*/

export const AppMachine = new StateMachine<AppState, AppStateStore>(initialState, AppTransitions);

const root = ReactDOM.createRoot(document.getElementById('root')!);


async function renderComponent(component: React.ReactNode) {
  const client = await connect({} as ClientOptions);
  root.render(
    <React.StrictMode>
      <ApolloProvider client={client}>
        <MyProfileProvider>
          <StateMachineContext.Provider value={AppMachine as any}>
            <App>
              {component}
            </App>
          </StateMachineContext.Provider>
        </MyProfileProvider>
      </ApolloProvider>
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
