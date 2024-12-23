import { useAtomValue, useAtom, useSetAtom } from "jotai";
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
  newTraversalLevelIndexId,
} from "../state";
import { useNodeTraversal } from "./useNodeTraversal";

/**
 * Custom hook to manage the orbit tree data and state
 * @param sphere - The selected sphere
 * @returns An object containing various state values and setters
 */
export const useOrbitTreeData = (sphereHashes) => {
  const hasNodes = useAtomValue(currentSphereHasCachedNodesAtom);
  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);
  const setNewRenderTraversalDetails = useSetAtom(newTraversalLevelIndexId);
  const { x, y } = useAtomValue(currentSphereHierarchyIndices);
  const setNewHierarchyIndices = useSetAtom(currentSphereHierarchyIndices);

  const { breadthIndex, setBreadthIndex } = useNodeTraversal(
    hierarchyBounds[sphereHashes.entryHash as keyof SphereHierarchyBounds]
  );

  // IndexDB Cached OrbitNodeDetails for the Sphere
  const nodeDetailsCache = useAtomValue(
    nodeCache.item(sphereHashes.actionHash)
  ) as SphereOrbitNodeDetails;

  return {
    nodeDetailsCache,
    hasNodes,
    hierarchyBounds,
    setBreadthBounds,
    depthBounds,
    setDepthBounds,
    x,
    y,
    breadthIndex,
    setBreadthIndex,
    setNewRenderTraversalDetails,
    setNewHierarchyIndices,
  };
};
