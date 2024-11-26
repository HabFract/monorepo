import "./App.css";
import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useThemeMode } from "flowbite-react";
import { initGraphQLClient } from "./graphql/client";
import PreloadAllData from "./components/PreloadAllData";
import { getConnection } from "./graphql/connection";
import { ApolloProvider } from "@apollo/client";
import { useStateTransition } from "./hooks/useStateTransition";
import { AppMachine } from "./main";
import { debounce } from "./components/vis/helpers";
import { Spinner } from "habit-fract-design-system";

const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const debouncedGetConnection = debounce(getConnection, 30000);

  useEffect(() => {
    if (!AppMachine.state.connection) {
      debouncedGetConnection().then((connection: any) => {
        // Create the connection object with required properties
        const newConnection = {
          dnaConfig: connection.dnaConfig,
          conductorUri: connection.client.client.url!.href,
        };
        // Initialize GraphQL client with the connection
        initGraphQLClient(newConnection).then((client) => {
          // Update the connection with the Apollo client
          AppMachine.state.connection = {
            ...newConnection,
            apolloClient: client
          };
          setIsConnected(true);
        });
      });
    } else {
      setIsConnected(true);
    }
  }, []);

  return {
    connected: isConnected,
    apolloClient: AppMachine.state.connection?.apolloClient,
  };
};

const BootSequence: React.FC = () => {
  const [_, transition] = useStateTransition();
  const dataPreloaded = useRef<boolean>(false)
  const { connected, apolloClient } = useConnection();
  const { mode, setMode, toggleMode } = useThemeMode();

  const handleDataPreloaded = useCallback(() => {
    dataPreloaded.current = true;
    setMode('dark')
    transition("Home");
  }, [transition]);

  if (!connected || !apolloClient) {
    return <Spinner />
  }

  if (!dataPreloaded.current) {
    return (
      <ApolloProvider client={apolloClient}>
        <PreloadAllData onPreloadComplete={handleDataPreloaded} />
      </ApolloProvider>
    );
  }

  return null;
};

export default React.memo(BootSequence);