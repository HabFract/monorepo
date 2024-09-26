import React, { ComponentType, useCallback, useEffect, useState } from 'react';
import { VisProps, VisCoverage, VisType } from './types';
import { hierarchy, HierarchyNode } from "d3-hierarchy";
import { OrbitHierarchyQueryParams, useGetLowestSphereHierarchyLevelQuery, useGetOrbitHierarchyLazyQuery } from '../../graphql/generated';

import { useAtom, useAtomValue } from 'jotai';
import { useStateTransition } from '../../hooks/useStateTransition';
import { nodeCache, store } from '../../state/jotaiKeyValueStore';
import { currentSphereHierarchyBounds, currentSphereHierarchyIndices, setBreadths, setDepths } from '../../state/hierarchy';
import { currentOrbitIdAtom } from '../../state/orbit';
import { newTraversalLevelIndexId } from '../../state/hierarchy';

import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { useFetchOrbitsAndCacheHierarchyPaths } from '../../hooks/useFetchOrbitsAndCacheHierarchyPaths';
import { TreeVisualization } from './base-classes/TreeVis';
import { currentSphereOrbitNodesAtom } from '../../state/orbit';
import { isSmallScreen } from './helpers';
import { useNodeTraversal } from '../../hooks/useNodeTraversal';
import { SphereOrbitNodes } from '../../state/types/sphere';
import { SphereHierarchyBounds } from '../../state/types/hierarchy';

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
  const nodeDetailsCache =  Object.fromEntries(useAtomValue(nodeCache.entries)) as SphereOrbitNodes;
  const nodes = useAtomValue(currentSphereOrbitNodesAtom);
  const needToUpdateCache = !nodes || typeof nodes !== 'object' || Object.keys(nodes).length === 0;
  const sphereNodeDetails = !needToUpdateCache 
    ? Object.fromEntries(Object.entries(nodes).map(([_, nodeDetails]) => [nodeDetails.eH, nodeDetails]))
    : {};
  // Get and set node traversal bounds state
  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);
  const {x,y} = useAtomValue(currentSphereHierarchyIndices)
  const { breadthIndex, setBreadthIndex } = useNodeTraversal(hierarchyBounds[sphere.entryHash as keyof SphereHierarchyBounds]);


  // Does this vis cover the whole tree, or just a window over the whole tree?
  const visCoverage = params?.orbitEh ? VisCoverage.CompleteOrbit : y == 0 ? VisCoverage.CompleteSphere : VisCoverage.Partial;

  // Helper to form the query parameter object
  const getQueryParams = (customDepth?: number): OrbitHierarchyQueryParams => visCoverage == VisCoverage.CompleteOrbit
    ? { orbitEntryHashB64: params.orbitEh }
    : { levelQuery: { sphereHashB64: params?.currentSphereEhB64, orbitLevel: customDepth || 0 } };

  // Helper to determine which part of the returned query data should be used in the Vis object
  const getJsonDerivation = (json: string) =>{ return visCoverage == VisCoverage.CompleteOrbit ? JSON.parse(json) : JSON.parse(json)[x]}
  // GQL Query hook, parsed JSON state, and Vis object state
  const [getHierarchy, { data, loading, error }] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "network-only"
  })
  const [json, setJson] = useState<string | null>(null);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<TreeVisualization | null>(null);

  const { data: dataLevel, loading: loadLevel, error: errorLevel } = useGetLowestSphereHierarchyLevelQuery({variables: {sphereEntryHashB64: sphere.entryHash as string}})

  // Traverse (but don't render) the root of the sphere's hierarchy so that we can cache the correct path to append at the top of the vis
  const [hasCached, setHasCached] = useState<boolean>(false);
  const { loading: loadCache, error: errorCache, cache } = useFetchOrbitsAndCacheHierarchyPaths({params: getQueryParams(dataLevel?.getLowestSphereHierarchyLevel || 0), hasCached, currentSphereId: sphere.actionHash as string, bypass: true})

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
      const hierarchyData = hierarchy(currentTreeJson).sort(byStartTime);
      
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
    if (!error && typeof data?.getOrbitHierarchy === 'string') {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      // Continue parsing if the result is still a string, this undoes more than one level of JSONification
      while (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }
      if(!!currentOrbitTree) { visCoverage == VisCoverage.Partial ? currentOrbitTree.resetZoomer() : currentOrbitTree.initializeZoomer() }
      // Set the limits of node traversal for breadth. If coverage is complete set to an arbitrary number
      console.log('parsedData.result.level_trees.length :>> ', parsedData.result);
      setBreadthBounds(params?.currentSphereEhB64, [0, visCoverage == VisCoverage.CompleteOrbit ? 100 : parsedData.result.level_trees.length - 1])

      // Fix for weird sort reversal bug (WTF?)
      const sorted = isSmallScreen() ? parsedData.result.level_trees.sort(byStartTime).reverse() : parsedData.result.level_trees.sort(byStartTime); 
      const isNewLevelXIndex = store.get(newTraversalLevelIndexId);
      let newLevelXIndex = isNewLevelXIndex && sorted.map(d => d.content).findIndex(id => id ==store.get(newTraversalLevelIndexId).id)
      if (isNewLevelXIndex) {
        store.set(newTraversalLevelIndexId, {id: null})
      }
      // Trigger path caching if we have appended a node
      const newHierarchyDescendants = hierarchy(sorted[0])?.sort(byStartTime)?.descendants()?.length;
      const oldHierarchyDescendants = currentOrbitTree?.rootData.descendants().length;
      setHasCached(newHierarchyDescendants == oldHierarchyDescendants);
      
      // Depending on query type, set the state of the parsed JSON to the relevant part of the payload
      setJson(JSON.stringify(visCoverage == VisCoverage.CompleteOrbit ? parsedData.result : sorted));

      // Set the default current Orbit
      const rootNode = visCoverage == VisCoverage.CompleteOrbit ? parsedData.result : sorted[newLevelXIndex !== -1 ? newLevelXIndex : 0];

      // Set the index of the current array of possible visualisations, based on new value passed through from the traversal controls
      store.set(currentOrbitIdAtom, rootNode?.content)
      if(newLevelXIndex !== -1) {
        store.set(currentSphereHierarchyIndices, {x: newLevelXIndex, y})
      }
      setBreadthIndex(newLevelXIndex !== -1 ? newLevelXIndex : breadthIndex)

    }
  }, [data])

  useEffect(instantiateVisObject, [json]);

  useEffect(() => {
    if (!error && typeof data?.getOrbitHierarchy === 'string' && currentOrbitTree) {
      // If there is a change to the parsed JSON or we traverse the parsed json's `level_trees` array (breadth traversal), then 
      // -- set the _nextRootData property of the vis, 
      // -- trigger a re-render
      currentOrbitTree._nextRootData = hierarchy(getJsonDerivation(json as string)).sort(byStartTime);
      store.set(currentOrbitIdAtom, currentOrbitTree._nextRootData.data.content)
      currentOrbitTree.render();
    }
  }, [json, x, y, data])

  return (
    <>
      {loading || needToUpdateCache &&  <span data-testid={'vis-spinner'} />}
      {!error && json && currentOrbitTree && render(currentOrbitTree, visCoverage, x, y, hierarchy(getJsonDerivation(json)))}
    </>
  )
};

export default React.memo(OrbitTree);

export function byStartTime(a: (HierarchyNode<unknown> | {content: string}), b: (HierarchyNode<unknown> | {content: string})) {
    //@ts-ignore
    const idA : ActionHashB64 = a?.data?.content || a?.content;
    //@ts-ignore
    const idB : ActionHashB64 = b?.data?.content || b?.content;
    const nodeDetailsCache = store.get(currentSphereOrbitNodesAtom);
    if((nodeDetailsCache?.[idB]?.startTime || 0  as number) - (nodeDetailsCache?.[idA as keyof SphereOrbitNodes]?.startTime || 0  as number) == 0) {
      console.error("Sorting error!")
      return 0
    }
    return isSmallScreen()
      ? (nodeDetailsCache?.[idB]?.startTime || 0  as number) - (nodeDetailsCache?.[idA as keyof SphereOrbitNodes]?.startTime || 0  as number)
      : (nodeDetailsCache?.[idA]?.startTime || 0  as number) - (nodeDetailsCache?.[idB as keyof SphereOrbitNodes]?.startTime || 0  as number)
}

