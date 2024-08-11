import { TWO_CHILDREN_LEFT_XS, THREE_CHILDREN_LEFT_XS, TWO_CHILDREN_RIGHT_XS, THREE_CHILDREN_RIGHT_XS, FOUR_CHILDREN_LEFT_1_XS, FOUR_CHILDREN_LEFT_2_XS, FIVE_CHILDREN_LEFT_1_XS, FIVE_CHILDREN_LEFT_2_XS, SIX_CHILDREN_LEFT_1_XS, SIX_CHILDREN_LEFT_2_XS, SIX_CHILDREN_LEFT_3_XS, FIVE_CHILDREN_RIGHT_1_XS, FIVE_CHILDREN_RIGHT_2_XS, FOUR_CHILDREN_RIGHT_1_XS, FOUR_CHILDREN_RIGHT_2_XS, SIX_CHILDREN_RIGHT_1_XS, SIX_CHILDREN_RIGHT_2_XS, SIX_CHILDREN_RIGHT_3_XS } from './../components/vis/PathTemplates/paths';
import { FIVE_CHILDREN_LEFT_1, FIVE_CHILDREN_LEFT_2, FIVE_CHILDREN_RIGHT_1, FIVE_CHILDREN_RIGHT_2, FOUR_CHILDREN_LEFT_1, FOUR_CHILDREN_LEFT_2, FOUR_CHILDREN_RIGHT_1, FOUR_CHILDREN_RIGHT_2, ONE_CHILD_XS, SIX_CHILDREN_LEFT_1, SIX_CHILDREN_LEFT_2, SIX_CHILDREN_LEFT_3, SIX_CHILDREN_RIGHT_1, SIX_CHILDREN_RIGHT_2, SIX_CHILDREN_RIGHT_3 } from '../components/vis/PathTemplates/paths';
import { useEffect, useState } from "react";
import {
  OrbitHierarchyQueryParams,
  useGetOrbitHierarchyQuery,
} from "../graphql/generated";
import {
  nodeCache,
  store,
  SphereNodeDetailsCache,
  SphereOrbitNodes,
} from "../state/jotaiKeyValueStore";
import { hierarchy } from "d3-hierarchy";
import { ActionHashB64 } from "@holochain/client";
import {
  ONE_CHILD,
  THREE_CHILDREN_LEFT,
  THREE_CHILDREN_RIGHT,
  TWO_CHILDREN_LEFT,
  TWO_CHILDREN_RIGHT,
} from "../components/vis/PathTemplates/paths";
import { currentSphere } from '../state/currentSphereHierarchyAtom';
import { useStateTransition } from './useStateTransition';

interface UseFetchAndCacheRootHierarchyOrbitPathsProps {
  params: OrbitHierarchyQueryParams;
  hasCached?: boolean; // pass true to bypass the hook
  currentSphereId: ActionHashB64
}

interface UseFetchAndCacheRootHierarchyOrbitPathsReturn {
  loading: boolean;
  error?: Error;
  cache: Function | null;
}

export const useFetchOrbitsAndCacheHierarchyPaths = ({
  params,
  hasCached = false,
  currentSphereId
}: UseFetchAndCacheRootHierarchyOrbitPathsProps): UseFetchAndCacheRootHierarchyOrbitPathsReturn => {
  if(!currentSphereId) return { loading: false, error: new Error("Cannot run hook withou a sphere Ah"), cache: null}

  const [_, transition] = useStateTransition(); // Top level state machine and routing
  const { data, loading, error } = useGetOrbitHierarchyQuery({
    skip: hasCached,
    variables: { params },
  });

  const [hierarchyObject, setHierarchyObject] = useState()

  const sphereNodes = store.get(nodeCache.items)![currentSphereId as keyof SphereNodeDetailsCache] as SphereOrbitNodes;
  
  if(Object.values(sphereNodes).length ==0) transition('CreateOrbit', { editMode: false, forwardTo: "Vis", sphereEh: store.get(currentSphere)?.entryHash })
  
  useEffect(() => {
    if (data) {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      // Continue parsing if the result is still a string, this undoes more than one level of JSONification
      while (typeof parsedData === "string") {
        parsedData = JSON.parse(parsedData);
      }
      setHierarchyObject(
        hierarchy(parsedData.result.level_trees[0]).sort((a, b) => {
          const idA: ActionHashB64 = a.data.content;
          const idB: ActionHashB64 = b.data.content;
          return (
            (sphereNodes?.[idA]?.startTime as number) || 0 -
            (sphereNodes?.[idB as keyof SphereOrbitNodes]?.startTime as number) || 0
          );
        })
      );
    }
  }, [data]);

  function cacheOrbitPaths(d3Hierarchy: object): boolean {
    let cached = false;
    let workingSphereNodes : SphereOrbitNodes = {...sphereNodes};
    try {
      if(!currentSphereId || currentSphereId == '') throw new Error('Cannot cache paths without a currentSphere id');
      const existingCache = store.get(nodeCache.items) as SphereNodeDetailsCache;
      if(!existingCache[currentSphereId]) throw new Error('No existing cache for this currentSphere id');

      (d3Hierarchy as any).each((node) => cachePath(node?.data?.content, getPath(node)));

      existingCache[currentSphereId] = workingSphereNodes;
      store.set(nodeCache.setMany, Object.entries(existingCache));

      cached = true;
      console.log('cached paths:>> ', cached);
    } catch (error) {
      console.error("Error caching hierarch paths:" + error);
    }
    return cached;
    
    function cachePath(id: string, path: string | null) {
      if(typeof id != 'string' || path == null) return;
      const cacheNodeItem = {...sphereNodes[id]};
      cacheNodeItem.path = path;
      workingSphereNodes[id] = cacheNodeItem
    }
  }
  function isMobile() {
    return document.body.getBoundingClientRect().width < 768 
  }

  function getPath(node) : string | null {
    // Skip the root node
    if (!node.parent) { return null; }

    // Calculate the relative index (1-based) and the number of siblings
    const relativeIndex = node.parent.children.indexOf(node) + 1;
    const numberOfSiblings = node.parent.children.length;

    // Determine if the node is a middle node
    const middleIndex = Math.ceil(numberOfSiblings / 2);
    const isMiddleNode = (numberOfSiblings % 2 !== 0) && relativeIndex === middleIndex;
    switch (true) {
      case isMiddleNode:
        return isMobile() ? ONE_CHILD_XS : ONE_CHILD;
      case relativeIndex <= numberOfSiblings / 2:
        return isMobile() ? getLeftSidePathXS(relativeIndex, numberOfSiblings) : getLeftSidePath(relativeIndex, numberOfSiblings);
      default:
        return isMobile() ? getRightSidePathXS(relativeIndex, numberOfSiblings) : getRightSidePath(relativeIndex, numberOfSiblings);
    }
  }
  
  const cache = !!hierarchyObject
    ? function(){cacheOrbitPaths(hierarchyObject)}
    : null;

  return {
    loading,
    error,
    cache,
  };
};

function getLeftSidePathXS(relativeIndex: number, numberOfSiblings: number) {
  switch (numberOfSiblings) {
    case 2:
      return TWO_CHILDREN_LEFT_XS;

    case 3:
      return THREE_CHILDREN_LEFT_XS;

    case 4:
      return relativeIndex == 1 ? FOUR_CHILDREN_LEFT_1_XS : FOUR_CHILDREN_LEFT_2_XS;

    case 5:
      return relativeIndex == 1 ? FIVE_CHILDREN_LEFT_1_XS : FIVE_CHILDREN_LEFT_2_XS;

    case 6:
      return relativeIndex == 1 ? SIX_CHILDREN_LEFT_1_XS :  relativeIndex == 2 ? SIX_CHILDREN_LEFT_2_XS : SIX_CHILDREN_LEFT_3_XS;
    // Enumerate up to as many as we will allow

    default:
      return ONE_CHILD;
  }
}

function getRightSidePathXS(relativeIndex: number, numberOfSiblings: number) {
  switch (numberOfSiblings) {
    case 2:
      return TWO_CHILDREN_RIGHT_XS;

    case 3:
      return THREE_CHILDREN_RIGHT_XS;

    case 4:
      return relativeIndex == 3 ? FOUR_CHILDREN_RIGHT_1_XS : FOUR_CHILDREN_RIGHT_2_XS;

    case 5:
      return relativeIndex == 4 ? FIVE_CHILDREN_RIGHT_1_XS : FIVE_CHILDREN_RIGHT_2_XS;

    case 6:
      return relativeIndex == 4 ? SIX_CHILDREN_RIGHT_1_XS :  relativeIndex == 5 ? SIX_CHILDREN_RIGHT_2_XS : SIX_CHILDREN_RIGHT_3_XS;

    default:
      return ONE_CHILD;
  }
}

function getLeftSidePath(relativeIndex: number, numberOfSiblings: number) {
  switch (numberOfSiblings) {
    case 2:
      return TWO_CHILDREN_LEFT;

    case 3:
      return THREE_CHILDREN_LEFT;

    case 4:
      return relativeIndex == 1 ? FOUR_CHILDREN_LEFT_1 : FOUR_CHILDREN_LEFT_2;

    case 5:
      return relativeIndex == 1 ? FIVE_CHILDREN_LEFT_1 : FIVE_CHILDREN_LEFT_2;

    case 6:
      return relativeIndex == 1 ? SIX_CHILDREN_LEFT_1 :  relativeIndex == 2 ? SIX_CHILDREN_LEFT_2 : SIX_CHILDREN_LEFT_3;
    // Enumerate up to as many as we will allow

    default:
      return ONE_CHILD;
  }
}

function getRightSidePath(relativeIndex: number, numberOfSiblings: number) {
  switch (numberOfSiblings) {
    case 2:
      return TWO_CHILDREN_RIGHT;

    case 3:
      return THREE_CHILDREN_RIGHT;

    case 4:
      return relativeIndex == 3 ? FOUR_CHILDREN_RIGHT_1 : FOUR_CHILDREN_RIGHT_2;

    case 5:
      return relativeIndex == 4 ? FIVE_CHILDREN_RIGHT_1 : FIVE_CHILDREN_RIGHT_2;

    case 6:
      return relativeIndex == 4 ? SIX_CHILDREN_RIGHT_1 :  relativeIndex == 5 ? SIX_CHILDREN_RIGHT_2 : SIX_CHILDREN_RIGHT_3;

    default:
      return ONE_CHILD;
  }
}
