import React from "react";
import ReactDOM from "react-dom/client";
import "broadcastchannel-polyfill";
import App from "./App";
import { StateMachine, StateStore } from "./state/types/stateMachine";
import {
  AppState,
  AppStateStore,
  AppTransitions,
  initialState,
  routes,
} from "./routes";
import { Provider } from "jotai";
import { store } from "./state/store";
import { ToastProvider } from "./contexts/toast";
import { StateMachineContext } from "./contexts/state-machine";
import BootSequence from "./BootSequence";
import { ApolloProvider } from "@apollo/client";
import { ModalProvider } from "./contexts/modal";

/*
Application State Management (Courtesy of Ada Burrows for hREA playspace)
============================
*/
export const AppMachine = new StateMachine<AppState, AppStateStore>(
  initialState,
  AppTransitions,
);

Object.entries(routes).forEach(([routeName, component]) => {
  AppMachine.on(routeName as AppState, async (state: StateStore<AppState>) => {
    const PageComponentWithProps = React.cloneElement(component as React.ReactElement, {
      ...state.params,
      key: JSON.stringify(state.params),
    });
    renderPage(PageComponentWithProps, AppMachine.state.connection.apolloClient);
  });
});

const root = ReactDOM.createRoot(document.getElementById("root")!);

export const withJotaiStore = (component: React.ReactNode) => {
  return <Provider store={store}>{component}</Provider>;
};

export async function renderPage(page: React.ReactNode, client) {
  root.render(
    <React.StrictMode>
      <ApolloProvider client={client}>
        <StateMachineContext.Provider value={AppMachine as any}>
          <ModalProvider>
            <ToastProvider>
              {withJotaiStore(<App>{page}</App>)}
            </ToastProvider>
          </ModalProvider>
        </StateMachineContext.Provider>
      </ApolloProvider>
    </React.StrictMode>
  );
}
const Main = () => {
  return (
    <StateMachineContext.Provider value={AppMachine}>
      <BootSequence />
    </StateMachineContext.Provider>
  );
};

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);