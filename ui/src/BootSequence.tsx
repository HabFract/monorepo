import "./App.css";
import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "flowbite-react";
import { initGraphQLClient } from "./graphql/client";
import PreloadAllData from "./components/PreloadAllData";
import { getConnection } from "./graphql/connection";
import { ApolloProvider } from "@apollo/client";
import { useStateTransition } from "./hooks/useStateTransition";
import { AppMachine } from "./main";
import { debounce } from "./components/vis/helpers";

const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const debouncedGetConnection = debounce(getConnection, 30000);

  useEffect(() => {
    if (!AppMachine.state.connection) {
      debouncedGetConnection().then((connection: any) => {
        AppMachine.state.connection = {
          ...connection,
          conductorUri: connection.client.client.url!.href,
        };
        initGraphQLClient(AppMachine.state.connection).then((client) => {
          AppMachine.state.connection.apolloClient = client;
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
  const [dataPreloaded, setDataPreloaded] = useState(false);
  const { connected, apolloClient } = useConnection();

  const handleDataPreloaded = useCallback(() => {
    setDataPreloaded(true);
    transition("Home");
  }, [transition]);

  if (!connected || !apolloClient) {
    return <Spinner aria-label="Connecting..." size="xl" className="full-spinner" />;
  }

  if (!dataPreloaded) {
    return (
      <ApolloProvider client={apolloClient}>
        <PreloadAllData onPreloadComplete={handleDataPreloaded} />
      </ApolloProvider>
    );
  }

  return null;
};

export default React.memo(BootSequence);