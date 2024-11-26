import React from "react";
import { StateMachine, StateStore } from "../state/types/stateMachine";
import { AppState } from "../routes";

export const StateMachineContext = React.createContext<StateMachine<
  AppState,
  StateStore<AppState>
> | null>(null);
