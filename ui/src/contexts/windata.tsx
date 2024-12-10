// contexts/winDataContext.tsx
import { useCallback, useRef } from 'react';
import { atom, useAtom } from 'jotai';
import { WinDataPerOrbitNode } from '../state/types';

const winStateAtom = atom<Record<string, WinDataPerOrbitNode>>({});

export function useWinDataState() {
  const [winState, setWinState] = useAtom(winStateAtom);

  const updateInProgressRef = useRef(false);

  const updateWinData = useCallback((orbitId: string, data: WinDataPerOrbitNode) => {
    if (updateInProgressRef.current) return;
    
    updateInProgressRef.current = true;
    setWinState(prev => {
      const newState = {
        ...prev,
        [orbitId]: data
      };
      updateInProgressRef.current = false;
      return newState;
    });
  }, []);

  return {
    winState,
    updateWinData
  };
}