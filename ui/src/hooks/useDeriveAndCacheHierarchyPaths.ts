import {
  AllSphereOrbitNodeDetails,
  SphereOrbitNodeDetails,
} from "./../state/types/sphere";
import {
  TWO_CHILDREN_LEFT_XS,
  THREE_CHILDREN_LEFT_XS,
  TWO_CHILDREN_RIGHT_XS,
  THREE_CHILDREN_RIGHT_XS,
  FOUR_CHILDREN_LEFT_1_XS,
  FOUR_CHILDREN_LEFT_2_XS,
  FIVE_CHILDREN_LEFT_1_XS,
  FIVE_CHILDREN_LEFT_2_XS,
  SIX_CHILDREN_LEFT_1_XS,
  SIX_CHILDREN_LEFT_2_XS,
  SIX_CHILDREN_LEFT_3_XS,
  FIVE_CHILDREN_RIGHT_1_XS,
  FIVE_CHILDREN_RIGHT_2_XS,
  FOUR_CHILDREN_RIGHT_1_XS,
  FOUR_CHILDREN_RIGHT_2_XS,
  SIX_CHILDREN_RIGHT_1_XS,
  SIX_CHILDREN_RIGHT_2_XS,
  SIX_CHILDREN_RIGHT_3_XS,
} from "../components/vis/links/paths";
import {
  FIVE_CHILDREN_LEFT_1,
  FIVE_CHILDREN_LEFT_2,
  FIVE_CHILDREN_RIGHT_1,
  FIVE_CHILDREN_RIGHT_2,
  FOUR_CHILDREN_LEFT_1,
  FOUR_CHILDREN_LEFT_2,
  FOUR_CHILDREN_RIGHT_1,
  FOUR_CHILDREN_RIGHT_2,
  ONE_CHILD_XS,
  SIX_CHILDREN_LEFT_1,
  SIX_CHILDREN_LEFT_2,
  SIX_CHILDREN_LEFT_3,
  SIX_CHILDREN_RIGHT_1,
  SIX_CHILDREN_RIGHT_2,
  SIX_CHILDREN_RIGHT_3,
} from "../components/vis/links/paths";
import { useEffect, useState } from "react";
import {
  OrbitHierarchyQueryParams,
  useGetOrbitHierarchyQuery,
} from "../graphql/generated";
import { nodeCache, store } from "../state/jotaiKeyValueStore";
import { currentSphereOrbitNodesAtom, getOrbitIdFromEh } from "../state/orbit";
import { hierarchy, HierarchyNode } from "d3-hierarchy";
import { ActionHashB64 } from "@holochain/client";
import {
  ONE_CHILD,
  THREE_CHILDREN_LEFT,
  THREE_CHILDREN_RIGHT,
  TWO_CHILDREN_LEFT,
  TWO_CHILDREN_RIGHT,
} from "../components/vis/links/paths";
import { byStartTime, isSmallScreen } from "../components/vis/helpers";
import { SphereOrbitNodes } from "../state/types/sphere";
import { OrbitNodeDetails } from "../state";

interface UseFetchAndCacheRootHierarchyOrbitPathsProps {
  params: OrbitHierarchyQueryParams;
  currentSphereId: ActionHashB64;
  bypassFetch: boolean;
  bypassEntirely: boolean;
}

interface UseFetchAndCacheRootHierarchyOrbitPathsReturn {
  loading: boolean;
  error?: Error;
  cache: Function | null;
}

export const useDeriveAndCacheHierarchyPaths = ({
  params,
  currentSphereId,
  bypassFetch,
  bypassEntirely,
}: UseFetchAndCacheRootHierarchyOrbitPathsProps): UseFetchAndCacheRootHierarchyOrbitPathsReturn => {
  if (bypassEntirely) return { loading: false, error: undefined, cache: null };
  if (!currentSphereId) {
    console.error("Cannot run hook without a sphere Id");
    return {
      loading: false,
      error: new Error("Cannot run hook without a sphere Id"),
      cache: null,
    };
  }
  const sphereNodes = store.get(
    currentSphereOrbitNodesAtom
  ) as SphereOrbitNodes;
  console.log("currentSphereId :>> ", currentSphereId);
  const { data, loading, error } = useGetOrbitHierarchyQuery({
    variables: { params },
    skip: bypassFetch,
  });

  const [hierarchyObject, setHierarchyObject] =
    useState<HierarchyNode<unknown>>();

  useEffect(() => {
    if (data) {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      // Continue parsing if the result is still a string, this undoes more than one level of JSONification
      while (typeof parsedData === "string") {
        parsedData = JSON.parse(parsedData);
      }

      setHierarchyObject(
        hierarchy(parsedData.result.level_trees[0]).sort(byStartTime)
      );
    }
  }, [data]);

  function cacheOrbitPaths(d3Hierarchy: object): boolean {
    let cached = false;
    let workingSphereNodes = {
      ...sphereNodes,
    } as SphereOrbitNodeDetails;
    try {
      if (!currentSphereId || currentSphereId == "")
        throw new Error("Cannot cache paths without a currentSphere id");
      const existingCache = store.get(
        nodeCache.items
      ) as AllSphereOrbitNodeDetails;
      if (!existingCache[currentSphereId])
        throw new Error("No existing cache for this currentSphere id");

      (d3Hierarchy as any)
        .sort(byStartTime)
        .each((node) =>
          cachePath(
            store.get(getOrbitIdFromEh(node?.data?.content)),
            getPath(node)
          )
        );
      existingCache[currentSphereId] = workingSphereNodes;
      store.set(nodeCache.setMany, Object.entries(existingCache));
      cached = true;
    } catch (error) {
      console.error("Error caching hierarch paths:" + error);
    }
    return cached;

    function cachePath(id: string, path: string | null) {
      if (typeof id != "string" || path == null) return;
      const cacheNodeItem = { ...sphereNodes[id] } as OrbitNodeDetails;
      cacheNodeItem.path = path;
      workingSphereNodes[id] = cacheNodeItem;
    }
  }

  function getPath(node): string | null {
    // Skip the root node
    if (!node.parent) {
      return null;
    }

    // Calculate the relative index (1-based) and the number of siblings
    const relativeIndex = node.parent.children.indexOf(node) + 1;
    const numberOfSiblings = node.parent.children.length;

    // Determine if the node is a middle node
    const middleIndex = Math.ceil(numberOfSiblings / 2);
    const isMiddleNode =
      numberOfSiblings % 2 !== 0 && relativeIndex === middleIndex;
    switch (true) {
      case isMiddleNode:
        return isSmallScreen() ? ONE_CHILD_XS : ONE_CHILD;
      case relativeIndex <= numberOfSiblings / 2:
        return isSmallScreen()
          ? getLeftSidePathXS(relativeIndex, numberOfSiblings)
          : getLeftSidePath(relativeIndex, numberOfSiblings);
      default:
        return isSmallScreen()
          ? getRightSidePathXS(relativeIndex, numberOfSiblings)
          : getRightSidePath(relativeIndex, numberOfSiblings);
    }
  }

  const cache = !!hierarchyObject
    ? function () {
        cacheOrbitPaths(hierarchyObject);
      }
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
      return relativeIndex == 1
        ? FOUR_CHILDREN_LEFT_1_XS
        : FOUR_CHILDREN_LEFT_2_XS;

    case 5:
      return relativeIndex == 1
        ? FIVE_CHILDREN_LEFT_1_XS
        : FIVE_CHILDREN_LEFT_2_XS;

    case 6:
      return relativeIndex == 1
        ? SIX_CHILDREN_LEFT_1_XS
        : relativeIndex == 2
          ? SIX_CHILDREN_LEFT_2_XS
          : SIX_CHILDREN_LEFT_3_XS;
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
      return relativeIndex == 3
        ? FOUR_CHILDREN_RIGHT_1_XS
        : FOUR_CHILDREN_RIGHT_2_XS;

    case 5:
      return relativeIndex == 4
        ? FIVE_CHILDREN_RIGHT_1_XS
        : FIVE_CHILDREN_RIGHT_2_XS;

    case 6:
      return relativeIndex == 4
        ? SIX_CHILDREN_RIGHT_1_XS
        : relativeIndex == 5
          ? SIX_CHILDREN_RIGHT_2_XS
          : SIX_CHILDREN_RIGHT_3_XS;

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
      return relativeIndex == 1
        ? SIX_CHILDREN_LEFT_1
        : relativeIndex == 2
          ? SIX_CHILDREN_LEFT_2
          : SIX_CHILDREN_LEFT_3;
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
      return relativeIndex == 4
        ? SIX_CHILDREN_RIGHT_1
        : relativeIndex == 5
          ? SIX_CHILDREN_RIGHT_2
          : SIX_CHILDREN_RIGHT_3;

    default:
      return ONE_CHILD;
  }
}
