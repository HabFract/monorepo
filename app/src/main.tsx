import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { StateMachine } from './state/stateMachine'
import { StateMachineContext } from './contexts/state-machine'
import { ApolloProvider } from '@apollo/client'
import { AppState, AppStateStore, AppTransitions, initialState, routes } from './routes'
import connect, { ClientOptions } from './graphql/client'
import { Provider } from 'jotai'
import { myStore } from './state/jotaiKeyValueStore'

/*

Application State Management (Courtesy of Ada Burrows for hREA playspace)
============================

*/

const WithCacheStore = (component: React.ReactNode) => {
  return (<Provider store={myStore}>
    {component}
  </Provider>)
};

const client = (async() => {
  const client = await connect({} as ClientOptions);

  const AppMachine = new StateMachine<AppState, AppStateStore>(initialState, AppTransitions);


  const root = ReactDOM.createRoot(document.getElementById('root')!);
  async function renderComponent(component: React.ReactNode) {
    root.render(
      <React.StrictMode>
        <ApolloProvider client={await client}>
          {/* <MyProfileProvider> */}
            <StateMachineContext.Provider value={AppMachine as any}>
              <App>
                {WithCacheStore(component)}
              </App>
            </StateMachineContext.Provider>
          {/* </MyProfileProvider> */}
        </ApolloProvider>
      </React.StrictMode>,
    );
  }
  
  return client
})() 


