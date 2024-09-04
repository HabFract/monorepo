
import { useEffect, useState } from 'react';
import { AppMachine, WithCacheStore } from './main';
import { ApolloProvider } from '@apollo/client';
import { App } from 'antd';
import { StateMachineContext } from './contexts/state-machine';
import { ToastProvider } from './contexts/toast';
import { getConnection } from './graphql/connection';
import { initGraphQLClient } from './graphql/client';

import './App.css'
import 'habit-fract-design-system/dist/style.css';
import './typo.css'
import { Spinner } from 'flowbite-react';

function BootScreen({ children }: any) {
  const [connected, setConnected] = useState<boolean>(false); // Top level state machine and routing
  const [apolloClient, setApolloClient] = useState<any>(); // Top level state machine and routing

  useEffect(() => {
    if (connected) return;

    getConnection().then(connection => {
      AppMachine.state.client = { ...connection, conductorUri: connection.client.client.url!.href }
      initGraphQLClient(AppMachine.state.client).then(client => {
        setApolloClient(client)
      });

      setConnected(true);
    })
  }, [connected])

  return !connected ? <Spinner aria-label="Loading!" size="xl" className='full-spinner' /> : (
    <ApolloProvider client={apolloClient}>
      {/* <MyProfileProvider> */}
      <StateMachineContext.Provider value={AppMachine as any}>
          <ToastProvider>
            <App>
                {WithCacheStore(children)}
            </App>
          </ToastProvider>
      </StateMachineContext.Provider>
      {/* </MyProfileProvider> */}
    </ApolloProvider>
  )
}

export default BootScreen