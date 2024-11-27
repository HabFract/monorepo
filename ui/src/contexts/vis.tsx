// VisContext.tsx
import React, { useRef } from 'react';
import { BaseVisualization } from '../components/vis/base-classes/BaseVis';

interface VisContextType {
  isAppendingNode: boolean;
  setIsAppendingNode: (value: boolean) => void;
  visRef: any;
}

export const VisContext = React.createContext<VisContextType | undefined>(undefined);

export const VisProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isAppendingNode, setIsAppendingNode] = React.useState(false);
  const visRef = useRef<BaseVisualization | null>(null);

  return (
    <VisContext.Provider value={{ isAppendingNode, setIsAppendingNode, visRef }}>
      {children}
    </VisContext.Provider>
  );
};

export const useVisContext = () => {
  const context = React.useContext(VisContext);
  if (context === undefined) {
    throw new Error('useVisContext must be used within a VisProvider');
  }
  return context;
};
