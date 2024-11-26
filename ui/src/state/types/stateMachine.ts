
export interface StateStore<T extends string | number | symbol> {
  currentState: T;
  params: any;
  connection: Connection | null;
  history: Array<{state: T, params: any}>;
}

export type StateTransitions<T extends string | number | symbol> = {
  [K in T]?: T[];
};

export interface Connection {
  apolloClient?: any;
  dnaConfig: any;
  conductorUri: any;
}

/**
 * The main mechanism for maintaining app loading state
 */

export class StateMachine<T extends string | number | symbol, S extends StateStore<T>> {
  state: S;
  transitions: StateTransitions<T>;
  private handlers: Map<T, (state: S) => void> = new Map();

  constructor(initialState: S, transitions: StateTransitions<T>) {
    this.state = initialState;
    this.transitions = transitions;
  }

  on(state: T, handler: (state: S) => void) {
    this.handlers.set(state, handler);
    return this;
  }

  to(newState: T, params: any = {}) {
    if (this.state.currentState) {
      this.state.history = [
        { state: this.state.currentState, params: this.state.params },
        ...(this.state.history || [])
      ].slice(0, 3);
    }

    this.state.currentState = newState;
    this.state.params = params;
    
    const handler = this.handlers.get(newState);
    if (handler) {
      handler(this.state);
    }
  }

  back() {
    if (this.state.history?.length > 0) {
      const [previousState, ...remainingHistory] = this.state.history;
      
      this.state.currentState = previousState.state;
      this.state.params = previousState.params;
      this.state.history = remainingHistory;
      
      const handler = this.handlers.get(previousState.state);
      if (handler) {
        handler(this.state);
      }
      return true;
    }
    return false;
  }
}
