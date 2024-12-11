import { createContext, useContext, useRef, useCallback } from 'react';
import { WinDataPerOrbitNode } from '../state/types';

// Use WeakMap to allow garbage collection when orbits are no longer referenced
const winDataCache = new WeakMap<object, WinDataPerOrbitNode>();

type WinDataContextType = {
  getWinData: (orbitKey: object) => WinDataPerOrbitNode | undefined;
  setWinData: (orbitKey: object, data: WinDataPerOrbitNode) => void;
};

export const WinDataContext = createContext<WinDataContextType>({
  getWinData: () => undefined,
  setWinData: () => {},
});

// Custom hook for win data cache management
export const useWinDataCache = () => {
  const getWinData = useCallback((orbitKey: object) => {
    return winDataCache.get(orbitKey);
  }, []);

  const setWinData = useCallback((orbitKey: object, data: WinDataPerOrbitNode) => {
    winDataCache.set(orbitKey, data);
  }, []);

  return { getWinData, setWinData };
};