import { useState } from "react";

import {
  setCurrentDepth,
  setCurrentBreadth,
  currentSphereHierarchyIndices,
} from "../state/hierarchy";
import { store } from "../state/jotaiKeyValueStore";
import { useAtom } from "jotai";
import { HierarchyBounds } from "../state/types/hierarchy";

export const useNodeTraversal = (hierarchyBounds: HierarchyBounds) => {
  const x = store.get(currentSphereHierarchyIndices).x;
  const y = store.get(currentSphereHierarchyIndices).y;

  const [_, setDepthIndex] = useAtom(setCurrentDepth);
  const [__, setBreadthIndex] = useAtom(setCurrentBreadth);

  const indices = store.get(currentSphereHierarchyIndices);
  const breadthIndex = indices?.x;
  const depthIndex = indices?.y;

  const incrementBreadth = () => {
    if (hierarchyBounds) {
      const newVal = breadthIndex + 1;
      setBreadthIndex(newVal);
      store.set(currentSphereHierarchyIndices, { x: newVal, y });
    }
  };

  const decrementBreadth = () => {
    const newVal = breadthIndex - 1;
    setBreadthIndex(newVal);
    store.set(currentSphereHierarchyIndices, { x: newVal, y });
  };

  const incrementDepth = () => {
    if (hierarchyBounds) {
      const newVal = depthIndex + 1;
      setDepthIndex(newVal);
      store.set(currentSphereHierarchyIndices, { x: 0, y: newVal });
      return newVal;
    }
  };

  const decrementDepth = () => {
    const newVal = depthIndex - 1;
    setDepthIndex(newVal);
    setBreadthIndex(0);
    store.set(currentSphereHierarchyIndices, { x: 0, y: newVal });
  };

  const maxBreadth = hierarchyBounds?.maxBreadth;
  const maxDepth = hierarchyBounds?.maxDepth; // TODO: remove this if it is no longer needed anywhere

  return {
    depthIndex,
    setDepthIndex,
    breadthIndex,
    setBreadthIndex,
    incrementBreadth,
    decrementBreadth,
    incrementDepth,
    decrementDepth,
    maxBreadth,
    maxDepth,
  };
};
