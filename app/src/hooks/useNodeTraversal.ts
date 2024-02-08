import { useState } from 'react';
import { HierarchyBounds } from '../state/currentSphereHierarchyAtom';
import { EntryHashB64 } from '@holochain/client';

export const useNodeTraversal = (hierarchyBounds: HierarchyBounds, selectedSphereHash: EntryHashB64) => {
  const [depthIndex, setDepthIndex] = useState<number>(0);
  const [breadthIndex, setBreadthIndex] = useState<number>(0);

  const incrementBreadth = () => {
    if (hierarchyBounds) {
      const newIndex = (breadthIndex + 1) <= hierarchyBounds.maxBreadth ? breadthIndex + 1 : breadthIndex;
      setBreadthIndex(newIndex);
    }
  };

  const decrementBreadth = () => {
    setBreadthIndex(breadthIndex > 0 ? breadthIndex - 1 : 0);
  };

  const incrementDepth = () => {
    if (hierarchyBounds) {
      const newIndex = (depthIndex + 1) <= hierarchyBounds.maxDepth ? depthIndex + 1 : depthIndex;
      setDepthIndex(newIndex);
    }
  };

  const decrementDepth = () => {
    setDepthIndex(depthIndex > 0 ? depthIndex - 1 : 0);
  };
  const maxBreadth = hierarchyBounds?.maxBreadth;
  const maxDepth = hierarchyBounds?.maxDepth;

  return { depthIndex, setDepthIndex, breadthIndex, setBreadthIndex, incrementBreadth, decrementBreadth, incrementDepth, decrementDepth, maxBreadth, maxDepth };
};
