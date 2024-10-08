// ui/src/hooks/useNavigationHelpers.ts
import { useCallback } from "react";
import { useAtom } from "jotai";
import {
  currentSphereHierarchyBounds,
  currentSphereHierarchyIndices,
  newTraversalLevelIndexId,
} from "../state/hierarchy";
import { currentOrbitIdAtom, currentOrbitDetailsAtom } from "../state/orbit";
import { currentSphereHashesAtom } from "../state/sphere";
import { store } from "../state/jotaiKeyValueStore";
import { Coords, SphereHashes, SphereHierarchyBounds } from "../state";
import { IVisualization, VisCoverage } from "../components/vis/types";
import { byStartTime, isSmallScreen } from "../components/vis/helpers";
import { OrbitNodeDetails } from "../state/types/orbit";

export function useNavigationHelpers(currentVis: IVisualization | null) {
  const [{ x, y }, setHierarchyIndices] = useAtom(
    currentSphereHierarchyIndices
  );
  const [currentOrbitDetails] = useAtom(currentOrbitDetailsAtom);
  const [currentSphereHashes] = useAtom(currentSphereHashesAtom);
  const currentSphereEntryHash = currentSphereHashes!.entryHash;
  const [sphereHierarchyBounds] = useAtom(currentSphereHierarchyBounds);

  const hierarchyBounds = sphereHierarchyBounds?.[
    currentSphereEntryHash as keyof SphereHierarchyBounds
  ] || { maxBreadth: 0, maxDepth: 0 };
  const { maxBreadth, maxDepth } = hierarchyBounds;
  const [, setCurrentOrbitId] = useAtom(currentOrbitIdAtom);

  // Proceed even if currentVis is null
  const generateNavigationFlags = useCallback(
    (coords: Coords, currentOrbit: OrbitNodeDetails | null) => {
      // Provide default values or handle null checks
      const { x, y } = coords;
      const rootId = currentVis?.rootData.data.content || "";
      const children = (currentVis?.rootData.children || []).sort(byStartTime);
      const canMove =
        !isSmallScreen() ||
        currentVis!.coverageType === VisCoverage.CompleteSphere;
      const currentOrbitIsRoot = currentOrbit!.id === rootId;
      const hasOneChild = children.length === 1;

      return {
        canMove,
        canMoveUp: canMove && rootId !== currentOrbit!.id,
        canTraverseUp: y !== 0,
        canMoveLeft:
          canMove &&
          !currentOrbitIsRoot &&
          children[0].data.content !== currentOrbit!.id,
        canMoveRight:
          canMove &&
          !currentOrbitIsRoot &&
          children[children.length - 1].data.content !== currentOrbit!.id,
        canMoveDown: canMove && currentOrbitIsRoot && children.length !== 2,
        canTraverseDownMiddle: !!children
          .slice(1, -1)
          .find(
            (child) =>
              child.children &&
              child.children.length > 0 &&
              child.data.content === currentOrbit?.id
          ),
        canTraverseLeft: x !== 0 && currentOrbitIsRoot,
        canTraverseRight: currentOrbitIsRoot && maxBreadth && x < maxBreadth,
      };
    },
    [currentVis, maxBreadth, maxDepth]
  );

  const generateNavigationActions = useCallback(
    (currentOrbit: OrbitNodeDetails) => {
      return {
        moveLeft: () => {
          const children = currentVis!.rootData.children || [];
          const currentIndex = children.findIndex(
            (child) => child.data.content === currentOrbit.id
          );
          if (currentIndex > 0) {
            const newId = children[currentIndex - 1].data.content;
            setCurrentOrbitId(newId);
          }
        },
        moveRight: () => {
          const children = currentVis!.rootData.children || [];
          const currentIndex = children.findIndex(
            (child) => child.data.content === currentOrbit.id
          );
          if (currentIndex < children.length - 1) {
            const newId = children[currentIndex + 1].data.content;
            setCurrentOrbitId(newId);
          }
        },
        traverseRight: () => {
          setHierarchyIndices((prev) => ({ ...prev, x: prev.x + 1 }));
        },
        traverseLeft: () => {
          setHierarchyIndices((prev) => ({ ...prev, x: prev.x - 1 }));
        },
        traverseDown: () => {
          setHierarchyIndices((prev) => ({ ...prev, y: prev.y + 1 }));
          store.set(newTraversalLevelIndexId, {
            id: currentOrbit.id,
            direction: "down",
          });
        },
        traverseUp: () => {
          setHierarchyIndices((prev) => ({ ...prev, y: prev.y - 1 }));
          store.set(newTraversalLevelIndexId, {
            id: currentOrbit.parentEh,
            direction: "up",
          });
        },
        moveDown: () => {
          const children = currentVis!.rootData.children || [];
          if (children.length > 0) {
            const newId = children[0].data.content;
            setCurrentOrbitId(newId);
          }
        },
        moveUp: () => {
          const newId =
            currentOrbit.parentEh || currentVis!.rootData.data.content;
          setCurrentOrbitId(newId);
        },
      };
    },
    [currentVis, setCurrentOrbitId, setHierarchyIndices]
  );

  const createConsolidatedActions = useCallback(
    (flags, actions: ReturnType<typeof generateNavigationActions>) => ({
      goUp: () => (flags.canMoveUp ? actions.moveUp() : actions.traverseUp()),
      goDown: () =>
        flags.canMoveDown ? actions.moveDown() : actions.traverseDown(),
      goLeft: () =>
        flags.canMoveLeft ? actions.moveLeft() : actions.traverseLeft(),
      goRight: () =>
        flags.canMoveRight ? actions.moveRight() : actions.traverseRight(),
    }),
    []
  );

  return {
    generateNavigationFlags,
    generateNavigationActions,
    createConsolidatedActions,
  };
}
