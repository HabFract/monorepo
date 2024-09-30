import { useAtomValue, useAtom } from "jotai";
import {
  nodeCache,
  currentSphereOrbitNodesAtom,
  currentSphereHierarchyBounds,
  setBreadths,
  setDepths,
  currentSphereHierarchyIndices,
  SphereHierarchyBounds,
  SphereOrbitNodes,
} from "../state";
import { useNodeTraversal } from "./useNodeTraversal";

/**
 * Custom hook to manage the orbit tree data and state
 * @param sphere - The selected sphere
 * @returns An object containing various state values and setters
 */
export const useOrbitTreeData = (sphere) => {
  const nodeDetailsCache = useAtomValue(nodeCache.entries);
  const nodes = useAtomValue(currentSphereOrbitNodesAtom);
  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);
  const { x, y } = useAtomValue(currentSphereHierarchyIndices);
  const { breadthIndex, setBreadthIndex } = useNodeTraversal(
    hierarchyBounds[sphere.entryHash as keyof SphereHierarchyBounds]
  );

  return {
    nodeDetailsCache: Object.fromEntries(nodeDetailsCache) as SphereOrbitNodes,
    nodes,
    hierarchyBounds,
    setBreadthBounds,
    depthBounds,
    setDepthBounds,
    x,
    y,
    breadthIndex,
    setBreadthIndex,
  };
};
