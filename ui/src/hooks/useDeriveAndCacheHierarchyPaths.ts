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
import { nodeCache, store } from "../state/store";
import { currentSphereOrbitNodeDetailsAtom } from "../state/orbit";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
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
import { TreeVisualization } from "../components/vis/base-classes/TreeVis";

interface UseFetchAndCacheRootHierarchyOrbitPathsProps {
  currentTree: TreeVisualization;
  currentSphereId: ActionHashB64;
  bypassEntirely: boolean;
}

interface UseFetchAndCacheRootHierarchyOrbitPathsReturn {
  cache: Function | null;
}

export const useDeriveAndCacheHierarchyPaths = ({
  currentTree,
  currentSphereId,
  bypassEntirely,
}: UseFetchAndCacheRootHierarchyOrbitPathsProps): UseFetchAndCacheRootHierarchyOrbitPathsReturn => {
  if (bypassEntirely || !currentTree) return { cache: null };
  if (!currentSphereId) {
    console.error("Cannot run hook without a sphere Id");
    return {
      cache: null,
    };
  }
  const sphereNodes = store.get(
    currentSphereOrbitNodeDetailsAtom
  ) as SphereOrbitNodeDetails;

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
        .each((node) => cachePath(node?.data?.content, getPath(node)));
      existingCache[currentSphereId] = workingSphereNodes;
      store.set(nodeCache.setMany, Object.entries(existingCache));
      cached = true;
    } catch (error) {
      console.error("Error caching hierarch paths:" + error);
    }
    return cached;

    function cachePath(eH: EntryHashB64, path: string | null) {
      if (typeof eH != "string" || path == null) return;
      const cacheNodeItem = { ...sphereNodes[eH] } as OrbitNodeDetails;
      cacheNodeItem.path = path;
      workingSphereNodes[eH] = cacheNodeItem;
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

  const cache = !!currentTree.rootData
    ? function () {
        cacheOrbitPaths(currentTree.rootData);
      }
    : null;

  return {
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
