import { FIVE_CHILDREN_LEFT_1, FIVE_CHILDREN_LEFT_2, FIVE_CHILDREN_RIGHT_1, FIVE_CHILDREN_RIGHT_2, FOUR_CHILDREN_LEFT_1, FOUR_CHILDREN_LEFT_2, FOUR_CHILDREN_RIGHT_1, FOUR_CHILDREN_RIGHT_2, SIX_CHILDREN_LEFT_1, SIX_CHILDREN_LEFT_2, SIX_CHILDREN_LEFT_3, SIX_CHILDREN_RIGHT_1, SIX_CHILDREN_RIGHT_2, SIX_CHILDREN_RIGHT_3 } from './../components/vis/PathTemplates/paths';
import { useEffect } from "react";
import {
  OrbitHierarchyQueryParams,
  useGetOrbitHierarchyQuery,
} from "../graphql/generated";
import {
  OrbitNodeDetails,
  SphereOrbitNodes,
} from "../state/jotaiKeyValueStore";
import { nodeCache, store } from "../state/jotaiKeyValueStore";
import { hierarchy } from "d3-hierarchy";
import { ActionHashB64 } from "@holochain/client";
import {
  ONE_CHILD,
  THREE_CHILDREN_LEFT,
  THREE_CHILDREN_RIGHT,
  TWO_CHILDREN_LEFT,
  TWO_CHILDREN_RIGHT,
} from "../components/vis/PathTemplates/paths";

interface UseFetchAndCacheRootHierarchyOrbitPathsProps {
  params: OrbitHierarchyQueryParams;
  hasCached?: boolean; // pass true to bypass the hook
  sphereNodes: SphereOrbitNodes;
}

interface UseFetchAndCacheRootHierarchyOrbitPathsReturn {
  loading: boolean;
  error?: Error;
  cached?: boolean;
}

export const useFetchAndCacheRootHierarchyOrbitPaths = ({
  params,
  hasCached = false,
  sphereNodes,
}: UseFetchAndCacheRootHierarchyOrbitPathsProps): UseFetchAndCacheRootHierarchyOrbitPathsReturn => {
  const rootLevel = 0; // NOTE: this will potentially be negative in the future and will have to be figured out from new backend functionality
  params.orbitEntryHashB64 =
    "uhCEklRNoI3bojjmGey-JfZx66MWPgwQeEPtsWTRsxfeysPxgqPgk";
  const { data, loading, error } = useGetOrbitHierarchyQuery({
    skip: hasCached,
    variables: { params },
  });

  let cached: boolean = false;

  useEffect(() => {
    if (data) {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      // Continue parsing if the result is still a string, this undoes more than one level of JSONification
      while (typeof parsedData === "string") {
        parsedData = JSON.parse(parsedData);
      }
      cached = cacheOrbitPaths(
        hierarchy(parsedData.result).sort((a, b) => {
          const idA: ActionHashB64 = a.data.content;
          const idB: ActionHashB64 = b.data.content;
          return (
            (sphereNodes[idA].startTime as number) -
            (sphereNodes[idB as keyof SphereOrbitNodes].startTime as number)
          );
        })
      );
    }
  }, [data]);

  function cacheOrbitPaths(d3Hierarchy: object): boolean {
    let cached = false;
    try {
      (d3Hierarchy as any).each((node) => {
        const path = getPath(node);
      });
      cached = true;
    } catch (error) {
      console.error("Error caching hierarch paths:" + error);
    }
    return cached;
  }

  function cacheHierarchyNode(path: string) {}
  function getPath(node) {
    // Skip the root node
    if (!node.parent) {
      return;
    }

    // Calculate the relative index (1-based) and the number of siblings
    const relativeIndex = node.parent.children.indexOf(node) + 1;
    const numberOfSiblings = node.parent.children.length;

    // Determine if the node is a middle node
    const middleIndex = Math.ceil(numberOfSiblings / 2);
    const isMiddleNode = relativeIndex === middleIndex;
    switch (true) {
      case isMiddleNode:
        return ONE_CHILD;
      case relativeIndex <= numberOfSiblings / 2:
        console.log(getLeftSidePath(relativeIndex, numberOfSiblings));
        break;
      default:
        console.log(getRightSidePath(relativeIndex, numberOfSiblings));
    }
  }

  return {
    loading,
    error,
    cached,
  };
};

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
      return relativeIndex == 1 ? FOUR_CHILDREN_RIGHT_1 : FOUR_CHILDREN_RIGHT_2;

    case 5:
      return relativeIndex == 1 ? FIVE_CHILDREN_RIGHT_1 : FIVE_CHILDREN_RIGHT_2;

    case 6:
      return relativeIndex == 1 ? SIX_CHILDREN_RIGHT_1 :  relativeIndex == 2 ? SIX_CHILDREN_RIGHT_2 : SIX_CHILDREN_RIGHT_3;

    default:
      return ONE_CHILD;
  }
}
