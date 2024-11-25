export type State = string | number | symbol;

export type StateTransitions<S extends State> = Record<S, Array<S>>;

export interface StateStore<S extends State> {
  currentState: S;
  params: any;
  connection: any;
  history: Array<{state: S, params: any}>;
}

export type StateTransitionCallback<S extends State> = (
  _: StateStore<S>,
) => Promise<void>;

export type Callbacks<S extends State> = Record<S, StateTransitionCallback<S>>;

/**
 * The main mechanism for maintaining app loading state
 */

export class StateMachine<T, S extends StateStore<T>> {
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
