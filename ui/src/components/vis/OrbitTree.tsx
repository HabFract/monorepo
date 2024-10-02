import React, { ComponentType, useEffect, useState, useCallback, useMemo } from "react";
import { VisProps } from "./types";
import { hierarchy } from "d3-hierarchy";
import {
  useGetLowestSphereHierarchyLevelQuery,
  useGetOrbitHierarchyLazyQuery,
} from "../../graphql/generated";
import { useStateTransition } from "../../hooks/useStateTransition";
import { useOrbitTreeData } from "../../hooks/useOrbitTreeData";
import usePrefetchNextLevel from "../../hooks/gql/useFetchNextLevel";
import { store } from "../../state/jotaiKeyValueStore";
import { currentOrbitIdAtom } from "../../state/orbit";
import { useFetchOrbitsAndCacheHierarchyPaths } from "../../hooks/useFetchOrbitsAndCacheHierarchyPaths";
import { TreeVisualization } from "./base-classes/TreeVis";
import { byStartTime, determineNewLevelIndex, parseAndSortTrees } from "./helpers";
import { SphereOrbitNodes } from "../../state/types/sphere";
import { determineVisCoverage, generateQueryParams, deriveJsonData, createTreeVisualization, fetchHierarchyDataForLevel, handleZoomerInitialization, checkHierarchyCached, updateSphereHierarchyIndices, updateBreadthIndex, calculateAndSetBreadthBounds, parseOrbitHierarchyData } from "./tree-helpers";
import { currentSphereHierarchyIndices, newTraversalLevelIndexId } from "../../state";

export const OrbitTree: ComponentType<VisProps<TreeVisualization>> = ({
  selectedSphere: sphere,
  canvasHeight,
  canvasWidth,
  margin,
  render,
}) => {
  // ## -- Router level state -- ##
  const [_state, transition, params] = useStateTransition();


  // ## -- Component level state -- ##
  const [json, setJson] = useState<string | null>(null);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<TreeVisualization | null>(null);
  const [hasCachedNodes, setHasCachedNodes] = useState<boolean>(false); // Caching of OrbitNodeDetails
  const [usedCachedHierarchy, setUsedCachedHierarchy] = useState<boolean>(false); // Caching of hierarchy in Apollo client
  const [canTriggerNextTreeVisRender, setCanTriggerNextTreeVisRender] = useState<boolean>(false);

  // ## -- Data fetching hooks -- ##
  const [getHierarchy, { data, loading, error }] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "cache-and-network",
  });
  const { data: dataLevel } = useGetLowestSphereHierarchyLevelQuery({
    variables: { sphereEntryHashB64: sphere.entryHash as string },
  });


  // ## -- State for a specific TreeVis render -- ##

  // Hook to manage hierarchy traversal state
  const {
    nodes,
    setBreadthBounds,
    depthBounds,
    setDepthBounds,
    x,
    y,
    breadthIndex,
    setBreadthIndex,
  } = useOrbitTreeData(sphere); const needToUpdateNodeCache = useMemo(() =>
    !nodes || typeof nodes !== "object" || Object.keys(nodes).length === 0,
    [nodes]);

  // Cached OrbitNodeDetails for the Sphere
  const sphereNodeDetails = useMemo(() =>
    !needToUpdateNodeCache
      ? Object.fromEntries(
        Object.entries(nodes as SphereOrbitNodes).map(([_, nodeDetails]) => [
          nodeDetails.eH,
          nodeDetails,
        ]),
      )
      : {},
    [needToUpdateNodeCache, nodes]);

  // -- Memoised parameters/flags  --

  // Type of visualisation coverage for the sphere (partial or complete)
  const visCoverage = useMemo(() => determineVisCoverage(params, y), [params, y]);

  // Parameters for fetching data depend on the coverage type
  const getQueryParams = useCallback(generateQueryParams(visCoverage, params), [visCoverage, params]);


  // ## -- Initialisation/data retrieval/transformation callbacks  -- ##

  // Initialises a new TreeVis object to encapsulate layout, rendering and interactive elements of the vis
  const instantiateVisObject = () => {
    if (
      !error &&
      json &&
      !currentOrbitTree &&
      sphereNodeDetails
    ) {
      console.log("Instantiating tree...")
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
      setCurrentOrbitTree(newTree);
    }
  };

  // Transforms/derives correct form of d3 hierarchy JSON
  const getJsonDerivation = useCallback((json: string) => deriveJsonData(json, visCoverage, x), [json, visCoverage, x]);

  // Retrieves current level's hierarchy from the source chain
  const fetchCurrentLevel = async () => {
    let result = await fetchHierarchyDataForLevel({
      error,
      depthBounds,
      getQueryParams,
      y,
      getHierarchy,
    });
    setUsedCachedHierarchy(!!result);
    const newJson = !result
      ? JSON.parse(json!)?.sort(byStartTime)
      : JSON.stringify(parseAndSortTrees(result.getOrbitHierarchy));

    setJson(newJson);
    return newJson
  };

  // Transforms fetched level data and sets traversal bounds, zoom configuration and cache validity 
  const processNewHierarchyLevel = async (json) => {
    if (!json || !data?.getOrbitHierarchy) return;

    const sortedTrees = usedCachedHierarchy
      ? JSON.parse(json!)
      : parseOrbitHierarchyData(data.getOrbitHierarchy);

    console.log('Processing with result... :>> ', sortedTrees);
    setJson(JSON.stringify(sortedTrees));

    calculateAndSetBreadthBounds(setBreadthBounds, params, visCoverage, sortedTrees.length);
    const newLevelXIndex = determineNewLevelIndex(sortedTrees);
    const isNewLevelXIndexValid = (newLevelXIndex !== null && newLevelXIndex !== -1);

    isNewLevelXIndexValid && store.set(currentSphereHierarchyIndices, { x: newLevelXIndex, y });
    setBreadthIndex(isNewLevelXIndexValid ? newLevelXIndex : breadthIndex);

    handleZoomerInitialization(currentOrbitTree, visCoverage);

    setHasCachedNodes(checkHierarchyCached(sortedTrees, currentOrbitTree));
  };


  // Processes last fetched hierarchy level and triggers a new fetch - implicitly cached in the GraphQL client - for the next level down (in anticipation of next render)
  const processHierarchyLevelAndFetchNext = async (newJson) => {
    await processNewHierarchyLevel(newJson);
    const nextLevelQuery = getQueryParams(y + 1);
    usePrefetchNextLevel(nextLevelQuery, true);
  };


  // Caches link paths for each node on the current hierarchy which will be appended to the partial Visualisation types for visual continuity when traversing deeper than the root
  // TODO: remove the combined cacheing duties this currently has with OrbitNodeDetails
  const { cache } = useFetchOrbitsAndCacheHierarchyPaths({
    params: getQueryParams(dataLevel?.getLowestSphereHierarchyLevel || 0),
    hasCachedNodes,
    currentSphereId: sphere.actionHash as string,
    bypass: false,
  });


  // ## -- Execution of effect callbacks  -- ##

  // Initialises the TreeVis object ready for rendering in the return value of OrbitTree
  useEffect(instantiateVisObject, [json]);

  // Fetches data to populate the vis
  useEffect(() => {
    console.log("Fetching for coords...", x, y)

    const fetchAndProcess = async () => {
      let newJson = await fetchCurrentLevel()
      await processHierarchyLevelAndFetchNext(newJson)
      setCanTriggerNextTreeVisRender(true)
    };
    fetchAndProcess()
  }, [data, y]);

  // Sets up and triggers the next render when a new set of hierarchy data needs to be visualised
  useEffect(() => {
    if (
      canTriggerNextTreeVisRender &&
      !error &&
      currentOrbitTree &&
      json
    ) {
      console.log('Triggered a new hierarchy render in focus mode');

      currentOrbitTree._nextRootData = hierarchy(
        getJsonDerivation(json),
      ).sort(byStartTime);

      const newRenderNodeDetails = store.get(newTraversalLevelIndexId);
      const newDefaultNodeTarget = currentOrbitTree._nextRootData.data.children.sort(byStartTime)?.[0]?.content;
      // TODO: correct index above so that intermediate node is the correct one (not just 0)
      console.log('newRenderNodeDetails :>> ', newRenderNodeDetails);
      const newlySelectedNodeId = newRenderNodeDetails?.direction == 'up'
        ? currentOrbitTree._nextRootData.find(node => node.data.content == newRenderNodeDetails?.id)?.data?.content
        : newDefaultNodeTarget;
      console.log('New focused node... :>> ', newlySelectedNodeId);
      store.set(
        currentOrbitIdAtom,
        newlySelectedNodeId,
      );

      store.set(newTraversalLevelIndexId, { id: newlySelectedNodeId, intermediateId: newRenderNodeDetails?.direction == 'up' ? newDefaultNodeTarget : null });

      currentOrbitTree.startInFocusMode = true;
      currentOrbitTree.render();

      setCanTriggerNextTreeVisRender(false)
    }
  }, [json, canTriggerNextTreeVisRender]);

  // Trigger caching of link paths needed for visual continuity
  useEffect(() => {
    if (!hasCachedNodes && cache !== null) {
      try {
        console.log('Cached hierarchy link paths for visual continuity...');
        cache();
        setHasCachedNodes(true);
      } catch (error) {
        console.error(error);
      }
    }
  }, [cache, hasCachedNodes]);

  // ## -- RENDER  -- ##
  return (
    <>
      {loading || (needToUpdateNodeCache && <span data-testid={"vis-spinner"} />)}
      {!error &&
        json &&
        currentOrbitTree &&
        render(
          currentOrbitTree,
          visCoverage,
          x,
          y,
          hierarchy(getJsonDerivation(json)),
        )}
    </>
  );
};

export default React.memo(OrbitTree);
