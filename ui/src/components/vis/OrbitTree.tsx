import React, { ComponentType, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { VisProps } from "./types";
import { hierarchy } from "d3-hierarchy";
import {
  useGetLowestSphereHierarchyLevelQuery,
  useGetOrbitHierarchyLazyQuery,
} from "../../graphql/generated";
import { useStateTransition } from "../../hooks/useStateTransition";
import { useOrbitTreeData } from "../../hooks/useOrbitTreeData";
import usePrefetchNextLevel from "../../hooks/gql/useFetchNextLevel";
import { store } from "../../state/store";
import { currentOrbitIdAtom, currentSphereOrbitNodeDetailsAtom } from "../../state/orbit";
import { useDeriveAndCacheHierarchyPaths } from "../../hooks/useDeriveAndCacheHierarchyPaths";
import { TreeVisualization } from "./base-classes/TreeVis";
import { byStartTime, determineNewLevelIndex, parseAndSortTrees } from "./helpers";
import { determineVisCoverage, generateQueryParams, deriveJsonData, createTreeVisualization, fetchHierarchyDataForLevel, handleZoomerInitialization, updateSphereHierarchyIndices, updateBreadthIndex, calculateAndSetBreadthBounds, parseOrbitHierarchyData } from "./tree-helpers";
import { currentSphereHashesAtom, newTraversalLevelIndexId, SphereHashes, updateHierarchyAtom } from "../../state";
import { useSetAtom } from "jotai";
import { NODE_ENV } from "../../constants";

export const OrbitTree: ComponentType<VisProps<TreeVisualization>> = ({
  canvasHeight,
  canvasWidth,
  margin,
  render,
}) => {
  // ## -- Router level state -- ##
  const [_state, transition, params, client] = useStateTransition();

  // ## -- Component level state -- ##
  const [currentOrbitTree, setCurrentOrbitTreeState] = useState<TreeVisualization | null>(null);
  const currentOrbitTreeRef = useRef<TreeVisualization | null>(null);
  // When setting currentOrbitTree, also set the ref
  const setCurrentOrbitTree = (tree: TreeVisualization | null) => {
    currentOrbitTreeRef.current = tree;
    setCurrentOrbitTreeState(tree);
  };
  
  const [json, setJson] = useState<string | null>(null);
  const [hasCachedNodes, setHasCachedNodes] = useState<boolean>(false);
  const [usedCachedHierarchy, setUsedCachedHierarchy] = useState<boolean>(false);
  const [canTriggerNextTreeVisRender, setCanTriggerNextTreeVisRender] = useState<boolean>(false);
  const setNewCurrentOrbitId = useSetAtom(currentOrbitIdAtom);
  const setHierarchyInAppState = useSetAtom(updateHierarchyAtom);

  // ## -- Data fetching hooks -- ##
  const [getHierarchy, { data, loading, error }] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "network-only",
  });
  // Get the hashes of the current Sphere's context
  const sphere: SphereHashes = store.get(currentSphereHashesAtom);
  const { data: dataLevel } = useGetLowestSphereHierarchyLevelQuery({
    variables: { sphereEntryHashB64: sphere.entryHash as string },
  });

  // ## -- State for a specific TreeVis render -- ##
  const useVisState = useCallback(() => useOrbitTreeData(sphere), [sphere.actionHash]);
  const {
    setBreadthBounds,
    depthBounds,
    setDepthBounds,
    x,
    y,
    breadthIndex,
    setBreadthIndex,
    setNewHierarchyIndices,
    setNewRenderTraversalDetails
  } = useVisState();

  const sphereNodeDetails = store.get(currentSphereOrbitNodeDetailsAtom);

  const visCoverage = useMemo(() => determineVisCoverage(params, y), [params, y]);
  const getQueryParams = useCallback(generateQueryParams(visCoverage, sphere.entryHash!), [visCoverage, params]);

  const instantiateVisObject = () => {
    if (!error && json && !currentOrbitTree && sphereNodeDetails) {
      console.log("Instantiating tree...");
      const newTree = createTreeVisualization({
        json,
        visCoverage,
        canvasHeight,
        canvasWidth,
        margin,
        transition,
        params,
        sphereNodeDetails,
        getJsonDerivation,
        setDepthBounds,
      });
      setTimeout(() => {
        setNewCurrentOrbitId((newTree as TreeVisualization)!.rootData!.data.content);
      }, 250);
      setCurrentOrbitTree(newTree);
      newTree._json = json
      setHierarchyInAppState(newTree as any);
    }
  };

  const getJsonDerivation = useCallback((json: string) => deriveJsonData(json, visCoverage, x), [json, visCoverage, x]);

  const fetchCurrentLevel = async () => {
    let result = await fetchHierarchyDataForLevel({
      error,
      depthBounds,
      getQueryParams,
      y,
      getHierarchy,
      client
    });
    if (!json && (!result && !data)) return;
    setUsedCachedHierarchy(!!result);

    const newJson = !(result || data)
      ? JSON.parse(json!)?.sort(byStartTime)
      : JSON.stringify(parseAndSortTrees(result?.getOrbitHierarchy || data?.getOrbitHierarchy));

    setJson(newJson);
    return newJson;
  };

  const processNewHierarchyLevel = async (json) => {
    if (!json || !data?.getOrbitHierarchy) return;

    const sortedTrees = usedCachedHierarchy
      ? JSON.parse(json!)
      : parseOrbitHierarchyData(data.getOrbitHierarchy);

    !(NODE_ENV == 'test') && console.log('Processing with result... :>> ', sortedTrees);
    setJson(JSON.stringify(sortedTrees));

    calculateAndSetBreadthBounds(setBreadthBounds, params, visCoverage, sortedTrees.length);
    const newLevelXIndex = determineNewLevelIndex(sortedTrees);
    const isNewLevelXIndexValid = (newLevelXIndex !== null && newLevelXIndex !== -1);

    if (isNewLevelXIndexValid) {
      setNewHierarchyIndices({ x: newLevelXIndex, y });
    }
    setBreadthIndex(isNewLevelXIndexValid ? newLevelXIndex : breadthIndex);

    handleZoomerInitialization(currentOrbitTree, visCoverage);
  };

  const processHierarchyLevelAndFetchNext = async (newJson) => {
    await processNewHierarchyLevel(newJson);
    if (!currentOrbitTree?.rootData?.children || currentOrbitTree?.rootData && currentOrbitTree.rootData?.children && currentOrbitTree.rootData.children?.length === 0) return;

    const nextLevelQuery = getQueryParams(y + 1);
    console.log("Prefetching next level with query: ", nextLevelQuery);
    usePrefetchNextLevel(nextLevelQuery!, client, true);
  };

  const { cache } = useDeriveAndCacheHierarchyPaths({
    currentTree: currentOrbitTree as any,
    currentSphereId: sphere.actionHash as string,
    bypassEntirely: false,
  });

  useEffect(() => {
    instantiateVisObject();
  }, [json]);

  useEffect(() => {
    const fetchAndProcess = async () => {
      let newJson = await fetchCurrentLevel();
      console.log('newJson :>> ', newJson);
      if (!newJson) return;
      await processHierarchyLevelAndFetchNext(newJson);
      setCanTriggerNextTreeVisRender(true);
    };
    fetchAndProcess();
  }, [data, y]);

  useEffect(() => {
    setTimeout(() => setCanTriggerNextTreeVisRender(true), 0);
  }, [y, x]);

  useEffect(() => {
    if (canTriggerNextTreeVisRender && !error && currentOrbitTree && json) {
      console.log('Triggered a new hierarchy render in focus mode');

      currentOrbitTree._nextRootData = hierarchy(
        getJsonDerivation(json),
      ).sort(byStartTime);
      const newRenderNodeDetails = store.get(newTraversalLevelIndexId);
      const newDefaultNodeTarget = newRenderNodeDetails?.direction == 'new' ? newRenderNodeDetails.id : currentOrbitTree._nextRootData.data.children.sort(byStartTime)?.[0]?.content;

      const newlySelectedNodeId = !newRenderNodeDetails?.direction ? null :
        newRenderNodeDetails?.direction === 'up'
          ? (currentOrbitTree as any)!._originalRootData.find(node => node.data.content === newRenderNodeDetails?.id)?.data?.content
          : newDefaultNodeTarget;

      setNewCurrentOrbitId(newlySelectedNodeId);
      const noNewFocusNode = (newlySelectedNodeId == null || typeof newlySelectedNodeId === 'undefined');

      const reverseIntermediateNode = noNewFocusNode ? currentOrbitTree._nextRootData : (currentOrbitTree?.rootData?.children as any)?.[newRenderNodeDetails?.previousRenderSiblingIndex];
      if (!!reverseIntermediateNode) {
        currentOrbitTree._lastRenderParentId = reverseIntermediateNode.data.content;
      }

      const intermediateId = newRenderNodeDetails?.direction === 'up' ? currentOrbitTree._lastRenderParentId : (noNewFocusNode ? currentOrbitTree._nextRootData.data.content : null);
      console.log("Setting new render traversal details");
      setNewRenderTraversalDetails((prev) => ({ ...prev, id: newlySelectedNodeId, intermediateId }));

      currentOrbitTree.startInFocusMode = true;
      currentOrbitTree.render();

      setCanTriggerNextTreeVisRender(false);
    }
  }, [canTriggerNextTreeVisRender, json, x]);

  useEffect(() => {
    if (!hasCachedNodes && cache !== null) {
      try {
        console.log('Caching hierarchy link paths for visual continuity...');
        cache();
        setHasCachedNodes(true);
      } catch (error) {
        console.error(error);
      }
    }
  }, [cache, hasCachedNodes]);

  return (
    <>
      {loading && <span data-testid={"vis-spinner"} />}
      {!error &&
        json &&
        currentOrbitTree &&
        render(
          currentOrbitTree,
        )}
    </>
  );
};

export default React.memo(OrbitTree);