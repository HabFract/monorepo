import React, { ComponentType, useEffect, useState, useCallback, useMemo } from "react";
import { VisProps, VisCoverage, VisType } from "./types";
import { hierarchy } from "d3-hierarchy";
import {
  GetOrbitHierarchyDocument,
  OrbitHierarchyQueryParams,
  useGetLowestSphereHierarchyLevelQuery,
  useGetOrbitHierarchyLazyQuery,
} from "../../graphql/generated";
import { useAtom, useAtomValue } from "jotai";
import { useStateTransition } from "../../hooks/useStateTransition";
import usePrefetchNextLevel from "../../hooks/gql/useFetchNextLevel";
import { nodeCache, store } from "../../state/jotaiKeyValueStore";
import {
  currentSphereHierarchyBounds,
  currentSphereHierarchyIndices,
  setBreadths,
  setDepths,
  newTraversalLevelIndexId,
} from "../../state/hierarchy";
import { currentOrbitIdAtom } from "../../state/orbit";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useFetchOrbitsAndCacheHierarchyPaths } from "../../hooks/useFetchOrbitsAndCacheHierarchyPaths";
import { TreeVisualization } from "./base-classes/TreeVis";
import { currentSphereOrbitNodesAtom } from "../../state/orbit";
import { byStartTime, determineNewLevelIndex, parseAndSortTrees } from "./helpers";
import { useNodeTraversal } from "../../hooks/useNodeTraversal";
import { SphereOrbitNodes } from "../../state/types/sphere";
import { SphereHierarchyBounds } from "../../state/types/hierarchy";
import { client } from "../../graphql/client";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";

const useOrbitTreeData = (sphere) => {
  const nodeDetailsCache = useAtomValue(nodeCache.entries);
  const nodes = useAtomValue(currentSphereOrbitNodesAtom);
  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);
  const { x, y } = useAtomValue(currentSphereHierarchyIndices);
  const { breadthIndex, setBreadthIndex } = useNodeTraversal(
    hierarchyBounds[sphere.entryHash as keyof SphereHierarchyBounds],
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

export const OrbitTree: ComponentType<VisProps<TreeVisualization>> = ({
  selectedSphere: sphere,
  canvasHeight,
  canvasWidth,
  margin,
  render,
}) => {
  const [_state, transition, params] = useStateTransition();
  const {
    nodeDetailsCache,
    nodes,
    hierarchyBounds,
    setBreadthBounds,
    depthBounds,
    setDepthBounds,
    x,
    y,
    breadthIndex,
    setBreadthIndex,
  } = useOrbitTreeData(sphere);

  const needToUpdateCache = useMemo(() =>
    !nodes || typeof nodes !== "object" || Object.keys(nodes).length === 0,
    [nodes]);

  const sphereNodeDetails = useMemo(() =>
    !needToUpdateCache
      ? Object.fromEntries(
        Object.entries(nodes).map(([_, nodeDetails]) => [
          nodeDetails.eH,
          nodeDetails,
        ]),
      )
      : {},
    [needToUpdateCache, nodes]);

  const visCoverage = useMemo(() =>
    params?.orbitEh
      ? VisCoverage.CompleteOrbit
      : y == 0
        ? VisCoverage.CompleteSphere
        : VisCoverage.Partial,
    [params?.orbitEh, y]);

  const getQueryParams = useCallback((customDepth?: number): OrbitHierarchyQueryParams =>
    visCoverage == VisCoverage.CompleteOrbit
      ? { orbitEntryHashB64: params.orbitEh }
      : {
        levelQuery: {
          sphereHashB64: params?.currentSphereEhB64,
          orbitLevel: customDepth || 0,
        },
      },
    [visCoverage, params]);

  const getJsonDerivation = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed?.length && (x > parsed.length - 1)) console.error("Tried to traverse out of hierarchy bounds")
      return visCoverage == VisCoverage.CompleteOrbit ? parsed : parsed[x];
    } catch (error) {
      console.error("Error deriving parsed JSON from data: ", error);
    }
  }, [visCoverage, x]);

  const [getHierarchy, { data, loading, error }] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "cache-and-network",
  });
  const [json, setJson] = useState<string | null>(null);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<TreeVisualization | null>(null);

  const { data: dataLevel } = useGetLowestSphereHierarchyLevelQuery({
    variables: { sphereEntryHashB64: sphere.entryHash as string },
  });

  const [hasCached, setHasCached] = useState<boolean>(false);
  const { cache } = useFetchOrbitsAndCacheHierarchyPaths({
    params: getQueryParams(dataLevel?.getLowestSphereHierarchyLevel || 0),
    hasCached,
    currentSphereId: sphere.actionHash as string,
    bypass: false,
  });

  const instantiateVisObject = useCallback(() => {
    if (
      !error &&
      json &&
      !currentOrbitTree &&
      nodeDetailsCache[params?.currentSphereAhB64]
    ) {
      const currentTreeJson = getJsonDerivation(json);
      const hierarchyData = hierarchy(currentTreeJson).sort(byStartTime);

      setDepthBounds(params?.currentSphereEhB64, [
        0,
        visCoverage == VisCoverage.CompleteOrbit ? 100 : hierarchyData.height,
      ]);

      const orbitVis = new TreeVisualization(
        VisType.Tree,
        visCoverage,
        "vis",
        hierarchyData,
        canvasHeight,
        canvasWidth,
        margin,
        transition,
        params?.currentSphereEhB64 as EntryHashB64,
        params?.currentSphereAhB64 as ActionHashB64,
        sphereNodeDetails as SphereOrbitNodes,
      );
      setCurrentOrbitTree(orbitVis);
    }
  }, [error, json, currentOrbitTree, nodeDetailsCache, params, visCoverage, canvasHeight, canvasWidth, margin, transition, sphereNodeDetails, setDepthBounds, getJsonDerivation]);

  useEffect(() => {
    if (!hasCached && cache !== null) {
      try {
        cache();
        setHasCached(true);
      } catch (error) {
        console.error(error);
      }
    }
  }, [cache, hasCached]);

  useEffect(() => {
    const fetchHierarchyData = async () => {
      if (error) return;
      const query = depthBounds
        ? { ...getQueryParams(), orbitLevel: 0 }
        : getQueryParams(y);

      const gql: ApolloClient<NormalizedCacheObject> =
        (await client) as ApolloClient<NormalizedCacheObject>;

      const cachedData = (gql).readQuery({
        query: GetOrbitHierarchyDocument,
        variables: { params: { ...query } },
      });

      if (cachedData) {
        const sorted = parseAndSortTrees(cachedData.getOrbitHierarchy);
        const newLevelXIndex = determineNewLevelIndex(sorted, newTraversalLevelIndexId);
        setJson(JSON.stringify(sorted));
        if (newLevelXIndex !== -1) {
          store.set(currentSphereHierarchyIndices, { x: newLevelXIndex, y });
        }
        setBreadthIndex(newLevelXIndex !== -1 ? newLevelXIndex : breadthIndex);
      } else {
        getHierarchy({ variables: { params: { ...query } } });
      }
    };
    fetchHierarchyData()
  }, [y, error, getQueryParams, getHierarchy, depthBounds, setBreadthIndex, breadthIndex]);

  useEffect(() => {
    if (!error && typeof data?.getOrbitHierarchy === "string") {
      let sorted = parseAndSortTrees(data.getOrbitHierarchy);
      const newLevelXIndex = determineNewLevelIndex(sorted, newTraversalLevelIndexId);
      if (!!currentOrbitTree) {
        visCoverage == VisCoverage.Partial
          ? currentOrbitTree.resetZoomer()
          : currentOrbitTree.initializeZoomer();
      }
      setBreadthBounds(params?.currentSphereEhB64, [
        0,
        visCoverage == VisCoverage.CompleteOrbit
          ? 100
          : sorted.length - 1,
      ]);

      const newHierarchyDescendants = hierarchy(sorted[0])
        ?.sort(byStartTime)
        ?.descendants()?.length;
      const oldHierarchyDescendants =
        currentOrbitTree?.rootData.descendants().length;
      setHasCached(newHierarchyDescendants == oldHierarchyDescendants);

      setJson(JSON.stringify(sorted));

      if (newLevelXIndex !== -1) {
        store.set(currentSphereHierarchyIndices, { x: newLevelXIndex, y });
      }
      setBreadthIndex(newLevelXIndex !== -1 ? newLevelXIndex : breadthIndex);

      const nextLevelQuery = getQueryParams(y + 1);
      usePrefetchNextLevel(nextLevelQuery, !data);
    }
  }, [data, error, currentOrbitTree, visCoverage, params, setBreadthBounds, setBreadthIndex, breadthIndex, y, getQueryParams]);

  useEffect(instantiateVisObject, [json, instantiateVisObject]);

  useEffect(() => {
    if (
      !error &&
      typeof data?.getOrbitHierarchy === "string" &&
      currentOrbitTree &&
      json
    ) {
      currentOrbitTree._nextRootData = hierarchy(
        getJsonDerivation(json),
      ).sort(byStartTime);
      store.set(
        currentOrbitIdAtom,
        currentOrbitTree._nextRootData.data.content,
      );
      currentOrbitTree.startInFocusMode = true;
      currentOrbitTree.render();
    }
  }, [json, x, y, data, error, currentOrbitTree, getJsonDerivation]);

  return (
    <>
      {loading || (needToUpdateCache && <span data-testid={"vis-spinner"} />)}
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
