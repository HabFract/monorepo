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
  currentSphereHasCachedNodesAtom,
  SphereOrbitNodeDetails,
} from "../state";
import { useNodeTraversal } from "./useNodeTraversal";

/**
 * Custom hook to manage the orbit tree data and state
 * @param sphere - The selected sphere
 * @returns An object containing various state values and setters
 */
export const useOrbitTreeData = (sphereHashes) => {
  const nodes = useAtomValue(currentSphereOrbitNodesAtom);
  const hasNodes = useAtomValue(currentSphereHasCachedNodesAtom);
  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);
  const { x, y } = useAtomValue(currentSphereHierarchyIndices);
  const { breadthIndex, setBreadthIndex } = useNodeTraversal(
    hierarchyBounds[sphereHashes.entryHash as keyof SphereHierarchyBounds]
  );

  // IndexDB Cached OrbitNodeDetails for the Sphere
  const nodeDetailsCache = useAtomValue(nodeCache.item(sphereHashes.actionHash)) as SphereOrbitNodeDetails;

  return {
    nodeDetailsCache,
    hasNodes,
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
