import { useContext, useState } from 'react';
import { StateMachineContext } from '../contexts/state-machine';

export function useStateTransition() {
  const stateMachine = useContext(StateMachineContext) as any;

  if (!stateMachine) {
    throw new Error('useStateTransition must be used within a StateMachineProvider');
  }

  const [state, setState] = useState(stateMachine.currentState);

  const transition = (newState: string) => {
    stateMachine.to(newState);
    setState(newState);
  };

  return [state, transition];
}