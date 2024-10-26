import React from "react";
import { StateMachine } from "../state/types/stateMachine";
import { AppState, AppStateStore } from "../routes";

export const StateMachineContext = React.createContext<StateMachine<
  AppState,
  AppStateStore
> | null>(null);
