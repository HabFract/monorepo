import { useState, useRef } from 'react';
import { TreeVisualization } from "../base-classes/TreeVis";

export const useTreeState = () => {
  const [currentOrbitTree, setCurrentOrbitTreeState] = useState<TreeVisualization | null>(null);
  const currentOrbitTreeRef = useRef<TreeVisualization | null>(null);

  // When setting currentOrbitTree, also set the ref, used later to destroy/unbind and prevent memory leaks
  const setCurrentOrbitTree = (tree: TreeVisualization | null) => {
    currentOrbitTreeRef.current = tree;
    setCurrentOrbitTreeState(tree);
  };

  return {
    currentOrbitTree,
    currentOrbitTreeRef,
    setCurrentOrbitTree
  };
};