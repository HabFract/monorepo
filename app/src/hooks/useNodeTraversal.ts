import { useState } from 'react';
import { HierarchyBounds, currentOrbitCoords, currentOrbitDetails } from '../state/currentSphereHierarchyAtom';
import { EntryHashB64 } from '@holochain/client';
import { store } from '../state/jotaiKeyValueStore';

export const useNodeTraversal = (hierarchyBounds: HierarchyBounds) => {
  const x = store.get(currentOrbitCoords).x;
  const y = store.get(currentOrbitCoords).y;
  // const test = store.sub(currentOrbitCoords, () => { console.log(store.get(currentOrbitCoords)); })

  const [depthIndex, setDepthIndex] = useState<number>(x);
  const [breadthIndex, setBreadthIndex] = useState<number>(y);

  const currentOrbitId = store.get(currentOrbitDetails);
  // console.log('currentOrbitId :>> ', currentOrbitId);
  // const currentOrbitDetails = store.get(currentOrbitDetails);

  store.get(currentOrbitCoords)

  const incrementBreadth = () => {
    if (hierarchyBounds) {
      const newVal = (breadthIndex + 1) <= hierarchyBounds.maxBreadth ? breadthIndex + 1 : breadthIndex;
      setBreadthIndex(newVal);
      store.set(currentOrbitCoords, {x: newVal, y })
    }
  };

  const decrementBreadth = () => {
    const newVal = breadthIndex > 0 ? breadthIndex - 1 : 0;
    setBreadthIndex(newVal);
    store.set(currentOrbitCoords, {x: newVal, y })
  };

  const incrementDepth = () => {
    if (hierarchyBounds) {
      const newVal = (depthIndex + 1) <= hierarchyBounds.maxDepth ? depthIndex + 1 : depthIndex;
      setDepthIndex(newVal);
      setBreadthIndex(0);
      store.set(currentOrbitCoords, {x: 0, y: newVal })
    }
  };

  const decrementDepth = () => {
    const newVal = depthIndex > 0 ? depthIndex - 1 : 0
    setDepthIndex(newVal);
    setBreadthIndex(0);
    store.set(currentOrbitCoords, {x: 0, y: newVal })
  };
  
  const maxBreadth = hierarchyBounds?.maxBreadth;
  const maxDepth = hierarchyBounds?.maxDepth;
  
  return { depthIndex, setDepthIndex, breadthIndex, setBreadthIndex, incrementBreadth, decrementBreadth, incrementDepth, decrementDepth, maxBreadth, maxDepth };
};
