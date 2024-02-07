import { useState } from 'react';
import { HierarchyBounds } from '../state/currentSphereHierarchyAtom';

export const useIndexControls = (hierarchyBounds: HierarchyBounds, selectedSphereHash: string) => {
  const [depthIndex, setDepthIndex] = useState<number>(0);
  const [breadthIndex, setBreadthIndex] = useState<number>(0);

  const incrementBreadth = () => {
    const newIndex = (breadthIndex + 1) <= hierarchyBounds[selectedSphereHash]?.maxBreadth ? breadthIndex + 1 : breadthIndex;
    setBreadthIndex(newIndex);
  };

  const decrementBreadth = () => {
    setBreadthIndex(Math.max(0, breadthIndex - 1));
  };

  const incrementDepth = () => {
    const newIndex = (depthIndex + 1) <= hierarchyBounds[selectedSphereHash]?.maxDepth ? depthIndex + 1 : depthIndex;
    setDepthIndex(newIndex);
  };

  return { depthIndex, setDepthIndex, breadthIndex, setBreadthIndex, incrementBreadth, decrementBreadth, incrementDepth };
};
