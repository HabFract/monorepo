
import { useEffect, useState } from 'react';
import { AppMachine, WithCacheStore } from './main';
import { ApolloProvider } from '@apollo/client';
import { App } from 'antd';
import { StateMachineContext } from './contexts/state-machine';
import { getConnection } from './graphql/connection';
import { initGraphQLClient } from './graphql/client';
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { ask } from '@tauri-apps/plugin-dialog';

import './App.css'
import 'habit-fract-design-system/dist/style.css';
import './typo.css'
import { Spinner } from 'flowbite-react';

async function checkForAppUpdates(onUserClick: false) {
  const update = await check();
  console.log('Checked for update :>> ', update);
  if (!update) {
			return;
		} else if (update?.available) {
      const yes = await ask(`Update to ${update.version} is available!\n\nRelease notes: ${update.body}`, { 
        title: 'Update Available',
        kind: 'info',
        okLabel: 'Update',
        cancelLabel: 'Cancel'
      });
      if (yes) {
        await update.downloadAndInstall();
        await relaunch();
      }
    }
}

function BootScreen({ children }: any) {
  const [connected, setConnected] = useState<boolean>(false); // Top level state machine and routing
  const [apolloClient, setApolloClient] = useState<any>(); // Top level state machine and routing

  useEffect(() => {
    if(connected) return;
    checkForAppUpdates(false).then(update => {
      console.log(update)
    }).catch(err => {
      console.error(err)
    });
    getConnection().then(connection => {
      
      AppMachine.state.client = {...connection, conductorUri: connection.client.client.url!.href }
      initGraphQLClient(AppMachine.state.client).then(client => {
        setApolloClient(client)
      });

      setConnected(true);
    })
  }, [connected])
  
  return !connected ? <Spinner aria-label="Loading!"size="xl" className='full-spinner' /> : (
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