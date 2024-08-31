import React, { ComponentType, useEffect, useState } from 'react';
import { VisProps, VisCoverage, VisType } from './types';
import { hierarchy, HierarchyNode } from "d3-hierarchy";
import { OrbitHierarchyQueryParams, useGetLowestSphereHierarchyLevelQuery, useGetOrbitHierarchyLazyQuery } from '../../graphql/generated';

import { useAtom, useAtomValue } from 'jotai';
import { useStateTransition } from '../../hooks/useStateTransition';
import { SphereOrbitNodes, nodeCache, store } from '../../state/jotaiKeyValueStore';
import { currentOrbitCoords, currentSphereHierarchyBounds, setBreadths, setDepths } from '../../state/currentSphereHierarchyAtom';

import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { useFetchOrbitsAndCacheHierarchyPaths } from '../../hooks/useFetchOrbitsAndCacheHierarchyPaths';
import { TreeVisualization } from './TreeVis';

export const OrbitTree: ComponentType<VisProps<TreeVisualization>> = ({
  selectedSphere: sphere,
  canvasHeight,
  canvasWidth,
  margin,
  render
}) => {
  // Top level state machine and routing
  const [_state, transition, params] = useStateTransition();

  // Get sphere and sphere orbit nodes details
  const nodeDetailsCache =  Object.fromEntries(useAtomValue(nodeCache.entries));
  const sphereNodeDetails = nodeDetailsCache[params?.currentSphereAhB64] || {}

  // Get and set node traversal bound state
  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);
  const {x,y} = useAtomValue(currentOrbitCoords)
  // Does this vis cover the whole tree, or just a window over the whole tree?
  const visCoverage = params?.orbitEh ? VisCoverage.CompleteOrbit : y == 0 ? VisCoverage.CompleteSphere : VisCoverage.Partial;
  console.log('visCoverage :>> ', visCoverage);

  // Helper to form the query parameter object
  const getQueryParams = (customDepth?: number): OrbitHierarchyQueryParams => visCoverage == VisCoverage.CompleteOrbit
    ? { orbitEntryHashB64: params.orbitEh }
    : { levelQuery: { sphereHashB64: params?.currentSphereEhB64, orbitLevel: customDepth || 0 } };
  // Helper to determine which part of the returned query data should be used in the Vis object
  const getJsonDerivation = (json: string) => visCoverage == VisCoverage.CompleteOrbit ? JSON.parse(json) : JSON.parse(json)[x]
  // GQL Query hook, parsed JSON state, and Vis object state
  const [getHierarchy, { data, loading, error }] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "network-only"
  })
  const [json, setJson] = useState<string | null>(null);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<TreeVisualization | null>(null);

  const { data: dataLevel, loading: loadLevel, error: errorLevel } = useGetLowestSphereHierarchyLevelQuery({variables: {sphereEntryHashB64: sphere.entryHash as string}})

  // Traverse (but don't render) the root of the sphere's hierarchy so that we can cache the correct path to append at the top of the vis
  const [hasCached, setHasCached] = useState<boolean>(false);
  const { loading: loadCache, error: errorCache, cache } = useFetchOrbitsAndCacheHierarchyPaths({params: getQueryParams(dataLevel?.getLowestSphereHierarchyLevel || 0), hasCached, currentSphereId: sphere.actionHash as string})

  const fetchHierarchyData = () => {
    if (error) return;
    const query = depthBounds
      ? { ...getQueryParams(), orbitLevel: 0}//(depthBounds![params?.currentSphereEhB64] as any).minDepth } 
      : getQueryParams(y)

    getHierarchy({ variables: { params: { ...query } } })
  }

  const instantiateVisObject = () => {
    if (!error && json && !currentOrbitTree && nodeDetailsCache[params?.currentSphereAhB64]) {
      const currentTreeJson = getJsonDerivation(json);
      const hierarchyData = hierarchy(currentTreeJson).sort((a: HierarchyNode<any>, b: HierarchyNode<any>) : number => {
        const idA : ActionHashB64 = a.data.content;
        const idB : ActionHashB64 = b.data.content;
      if(!nodeDetailsCache[params?.currentSphereAhB64]) return 0;
        const sphereNodes = nodeDetailsCache[params?.currentSphereAhB64 as ActionHashB64] as SphereOrbitNodes;
        if(!sphereNodes?.[idA as keyof SphereOrbitNodes] || !sphereNodes?.[idB as keyof SphereOrbitNodes]) return 1
        return +(sphereNodes?.[idA]?.startTime || 0 as number) - (sphereNodes?.[idB as keyof SphereOrbitNodes]?.startTime || 0 as number)
      });
      
      setDepthBounds(params?.currentSphereEhB64, [0, visCoverage == VisCoverage.CompleteOrbit ? 100 : hierarchyData.height])

      const orbitVis = new TreeVisualization(
        VisType.Tree,
        visCoverage,
        'vis',
        hierarchyData,
        canvasHeight,
        canvasWidth,
        margin,
        transition,
        params?.currentSphereEhB64 as EntryHashB64,
        params?.currentSphereAhB64 as ActionHashB64,
        sphereNodeDetails as SphereOrbitNodes,
      );
      setCurrentOrbitTree(orbitVis)
    }
  }

  useEffect(() => {
    if(!hasCached && cache !== null) { // Check that the hook has finished fetching data and returned a cache function
      try {
        cache()
        setHasCached(true);
      } catch (error) {
        console.error(error)   
      }
    }
  }, [cache, data])

  useEffect(fetchHierarchyData, [y])

  useEffect(() => {
    const cacheEntries = nodeDetailsCache[params?.currentSphereAhB64] as SphereOrbitNodes;
    const byStartTime = (a, b) => {
      if(!cacheEntries) return 0;
      return (cacheEntries[a.content]?.startTime || 0) - (cacheEntries[b.content]?.startTime || 0)
    }
    if (!error && typeof data?.getOrbitHierarchy === 'string') {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      // Continue parsing if the result is still a string, this undoes more than one level of JSONification
      while (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }
      // Set the limits of node traversal for breadth. If coverage is complete set to an arbitrary number
      setBreadthBounds(params?.currentSphereEhB64, [0, visCoverage == VisCoverage.CompleteOrbit ? 100 : parsedData.result.level_trees.length - 1])
      // Trigger path cacheing if we have appended a node
      const newHierarchyDescendants = hierarchy(parsedData.result.level_trees?.sort(byStartTime)[x])?.descendants()?.length;
      const oldHierarchyDescendants = currentOrbitTree?.rootData.descendants().length;
      setHasCached(newHierarchyDescendants == oldHierarchyDescendants);

      // Depending on query type, set the state of the parsed JSON to the relevant part of the payload
      setJson(JSON.stringify(visCoverage == VisCoverage.CompleteOrbit ? parsedData.result : parsedData.result.level_trees.sort(byStartTime)));
    }
  }, [data])

  useEffect(instantiateVisObject, [json]);

  useEffect(() => {
    if (!error && typeof data?.getOrbitHierarchy === 'string' && currentOrbitTree) {
      // If there is a change to the parsed JSON or we traverse the parsed json's `level_trees` array (breadth traversal), then 
      // -- set the _nextRootData property of the vis, 
      // -- trigger a re-render
      currentOrbitTree._nextRootData = hierarchy(getJsonDerivation(json as string)).sort((a, b) => {
        const idA : ActionHashB64 = a.data.content;
        const idB : ActionHashB64 = b.data.content;
        const sphereNodes = nodeDetailsCache[params?.currentSphereAhB64 as ActionHashB64] as SphereOrbitNodes;
        return (sphereNodes?.[idA]?.startTime || 0 as number) - (sphereNodes?.[idB as keyof SphereOrbitNodes]?.startTime || 0 as number)
      });
      currentOrbitTree._nextRootData._translationCoords = [x, y, hierarchyBounds[params?.currentSphereEhB64].maxBreadth + 1];
      currentOrbitTree.render();
    }
  }, [json, x, y, data])
  return (
    <>
      {loading &&  <span data-testid={'vis-spinner'} />}
      {!error && json && currentOrbitTree && render(currentOrbitTree, visCoverage, x, y, hierarchy(getJsonDerivation(json)))}
    </>
  )
};

export default OrbitTree;
