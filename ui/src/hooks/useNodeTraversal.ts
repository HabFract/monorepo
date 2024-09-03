import { useState } from 'react';

import { HierarchyBounds } from '../state/currentSphereHierarchyAtom';
import { currentOrbitCoords } from '../state/orbit';
import { store } from '../state/jotaiKeyValueStore';

export const useNodeTraversal = (hierarchyBounds: HierarchyBounds) => {
  const x = store.get(currentOrbitCoords).x;
  const y = store.get(currentOrbitCoords).y;

  const [depthIndex, setDepthIndex] = useState<number>(x);
  const [breadthIndex, setBreadthIndex] = useState<number>(y);

  const coords = store.get(currentOrbitCoords);
  console.log('coords :>> ', coords);

  const incrementBreadth = () => {
    if (hierarchyBounds) {
      const newVal = breadthIndex + 1;
      setBreadthIndex(newVal);
      store.set(currentOrbitCoords, {x: newVal, y })
    }
  };

  const decrementBreadth = () => {
    const newVal = breadthIndex - 1;
    setBreadthIndex(newVal);
    store.set(currentOrbitCoords, {x: newVal, y })
  };

  const incrementDepth = () => {
    if (hierarchyBounds) {
      const newVal = depthIndex + 1;
      setDepthIndex(newVal);
      store.set(currentOrbitCoords, {x: 0, y: newVal })
    }
  };

  const decrementDepth = () => {
    const newVal = depthIndex - 1
    setDepthIndex(newVal);
    setBreadthIndex(0);
    store.set(currentOrbitCoords, {x: 0, y: newVal })
  };
  
  const maxBreadth = hierarchyBounds?.maxBreadth;
  const maxDepth = hierarchyBounds?.maxDepth; // TODO: remove this if it is no longer needed anywhere
  
  return { depthIndex, setDepthIndex, breadthIndex, setBreadthIndex, incrementBreadth, decrementBreadth, incrementDepth, decrementDepth, maxBreadth, maxDepth };
};
