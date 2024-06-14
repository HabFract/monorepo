
import { useEffect, useState } from 'react';
import { AppMachine, WithCacheStore } from './main';
import { ApolloProvider } from '@apollo/client';
import { App } from 'antd';
import { StateMachineContext } from './contexts/state-machine';
import { autoConnect } from './graphql/connection';
import { initGraphQLClient } from './graphql/client';

import './App.css'
import 'habit-fract-design-system/dist/style.css';
import './typo.css'

function BootScreen({ children }: any) {
  const [connected, setConnected] = useState<boolean>(false); // Top level state machine and routing
  const [apolloClient, setApolloClient] = useState<any>(); // Top level state machine and routing

  useEffect(() => {
    if(connected) return;
    autoConnect().then(connection => {
      AppMachine.state.client = connection
      initGraphQLClient(AppMachine.state.client).then(client => {
        setApolloClient(client)
      });

      setConnected(true);
    })
  }, [connected])
  
    return !connected ? "loading" : (
      <ApolloProvider client={apolloClient}>
      {/* <MyProfileProvider> */}
        <StateMachineContext.Provider value={AppMachine as any}>
          <App>
            {WithCacheStore(children)}
          </App>
        </StateMachineContext.Provider>
      {/* </MyProfileProvider> */}
    </ApolloProvider>
  )
}

export default BootScreen