import React, { ComponentType, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import "../vis/vis.css";

import { VisProps, VisCoverage, IVisualization } from "../vis/types";
import { useNodeTraversal } from "../../hooks/useNodeTraversal";
import {
  currentSphereHierarchyBounds,
  currentSphereHierarchyIndices,
  newTraversalLevelIndexId,
} from "../../state/hierarchy";

import {
  currentOrbitDetailsAtom,
  currentOrbitIdAtom,
  currentOrbitIsLeafAtom,
  currentSphereOrbitNodeDetailsAtom,
  getOrbitNodeDetailsFromEhAtom,
} from "../../state/orbit";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { store } from "../../state/store";
import { OrbitNodeDetails, SphereHashes } from "../../state/types";
import VisModal from "../VisModal";
import { OverlayLayout, Spinner } from "habit-fract-design-system";
import { currentDayAtom } from "../../state/date";
import { byStartTime, getCanvasDimensions, isSmallScreen } from "../vis/helpers";
import { currentSphereHashesAtom } from "../../state/sphere";
import { HierarchyNode } from "d3-hierarchy";
import {
  SphereHierarchyBounds,
  HierarchyBounds,
  Coords,
  NodeContent,
  ConsolidatedActions,
  ConsolidatedFlags,
  OrbitDescendant,
} from "../../state/types/hierarchy";
import { useAtom, useAtomValue } from "jotai";
import { useVisCanvas } from "../../hooks/useVisCanvas";
import { DEFAULT_MARGINS } from "../vis/constants";
import { StoreType } from "../../state/types/store";
import { useWinData } from "../../hooks/useWinData";
import { DateTime } from "luxon";
import { calculateCurrentStreakAtom, calculateLongestStreakAtom, setWinDataAtom } from "../../state/win";
import { useVisContext } from "../../contexts/vis";

/**
 * Higher-order component to enhance a visualization component with additional logic and state management.
 *
 * @template T the type of Visualisation object (Must extend the BaseVisualization interface)
 * @param {ComponentType<VisProps<T>>} Component - The visualization component to be enhanced.
 * @returns {ReactNode} A new component wrapped with additional logic and state management.
 *
 * @example
 * const EnhancedComponent = withVisCanvas(MyVisualizationComponent);
 *
 * @description
 * The `withVisCanvas` HOC is responsible for:
 * - Appending the visualization canvas to the DOM.
 * - Setting up sane defaults before rendering the visualization.
 * - Calculating logical conditions for the controls that need to be rendered.
 * - Encapsulating the traversal state and logic for navigating the visualization.
 *
 * This HOC abstracts away the complexity of managing the visualization's state and side effects,
 * allowing the wrapped component to focus on rendering the visualization itself.
 */
export function withVisCanvas<T extends IVisualization>(
  Component: ComponentType<VisProps<T>>,
): ReactNode {
  const ComponentWithVis = React.memo(() => {
    // Get the details of the current Orbit in context, and the calculated bounds for navigation of the rendered hierarchy
    // which will determine the state/visibility of the Vis OverlayLayout/controls
    const currentOrbitDetails: OrbitNodeDetails | null = useAtomValue(currentOrbitDetailsAtom);
    const currentOrbitIsLeaf = useAtomValue(currentOrbitIsLeafAtom);

    const currentOrbitStreakAtom = useMemo(() => calculateCurrentStreakAtom(currentOrbitDetails?.id as string), [currentOrbitDetails?.id])
    const currentStreak = store.get(currentOrbitStreakAtom);
    const currentOrbitLongestStreakAtom = useMemo(() => calculateLongestStreakAtom(currentOrbitDetails?.id as string), [currentOrbitDetails?.id])
    const longestStreak = store.get(currentOrbitLongestStreakAtom);
    const sphereHierarchyBounds: SphereHierarchyBounds = store.get(
      currentSphereHierarchyBounds,
    );
    const currentHierarchyIndices: Coords = store.get(
      currentSphereHierarchyIndices,
    );

    // Get the hashes of the current Sphere's context and use it as a useEffect dependency for appending the SVG canvas.
    const selectedSphere: SphereHashes = store.get(currentSphereHashesAtom);
    const { appendedSvg } = useVisCanvas(selectedSphere);
    const { canvasHeight, canvasWidth } = getCanvasDimensions();

    // Get actions for Node traversal and update of the hierarchy bounds/current indices
    const {
      incrementBreadth,
      decrementBreadth,
      incrementDepth,
      decrementDepth,
      maxBreadth,
      setBreadthIndex,
      maxDepth,
    } = useNodeTraversal(
      sphereHierarchyBounds[
      selectedSphere!.entryHash as keyof SphereHierarchyBounds
      ] as HierarchyBounds,
    );

    // ## -- Vis Layout level state -- ##
    const { isAppendingNode, setIsAppendingNode } = useVisContext();

    // ## -- Component level state -- ##
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const allFirstChildDescendantOrbits = useRef<any>(null);
    const [currentParentOrbitEh, setCurrentParentOrbitEh] =
      useState<EntryHashB64>();
    const [currentChildOrbitEh, setCurrentChildOrbitEh] =
      useState<EntryHashB64>();
    const resetModalParentChildStates = () => {
      setCurrentParentOrbitEh(undefined)
      setCurrentChildOrbitEh(undefined)
    }

    // Store and update date in local component state to ensure re-render with VisControls, Calendar
    const [currentDate, setCurrentDate] = useAtom<DateTime>(currentDayAtom);
    const visRef = useRef<T | null>(null);

    useEffect(() => {
      return () => {
        if (visRef.current && !isAppendingNode) {
          visRef.current.destroy();
          visRef.current = null;
        } else {
          setIsAppendingNode(false)
        }
      };
    }, []);

    // ## -- Hook for handling the fetching and updating of WinData for a given Orbit and Date -- ##
    const { workingWinDataForOrbit, handleUpdateWorkingWins, handlePersistWins, numberOfLeafOrbitDescendants } = useWinData(
      currentOrbitDetails, 
      currentDate
    );
    // TODO: handle derived error/loading states
    // const loading = useGetWinRecordForOrbitForMonthQueryLoading || createOrUpdateWinRecordLoading;
    // const error = useGetWinRecordForOrbitForMonthQueryError || createOrUpdateWinRecordError;


    return (
      <Component
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        margin={DEFAULT_MARGINS}
        render={(currentVis: T) => {
          if (!currentOrbitDetails?.eH) return <Spinner />
          visRef.current = currentVis;

          const {
            consolidatedFlags,
            consolidatedActions,
            orbitDescendants,
            orbitSiblings
          } = getActionsAndDataForControls(currentVis, currentOrbitDetails?.eH);

          if (appendedSvg) {
            // Pass through setState handlers for the current append/prepend Node parent/child entry hashes
            currentVis.modalOpen = setIsModalOpen;
            currentVis.modalParentOrbitEh = (val) => { console.log('Set parent id for new orbit in modal :>> ', val); setCurrentParentOrbitEh(val) };
            currentVis.modalChildOrbitEh = setCurrentChildOrbitEh;
            // Trigger the Vis object render function ONLY once the SVG is appended to the DOM
            currentVis?.render();
          }
          return (
            <>
              {/* Magnification Icon for indicating when full zoom capability is present */}
              {/* {currentVis.coverageType == VisCoverage.CompleteSphere && currentHierarchyIndices.y == 0 && <svg className="top-20 right-4 dark:text-white fixed w-6 h-6 text-white text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M21.707 21.707a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.414l3.5 3.5a1 1 0 0 1 0 1.414ZM2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm9-3a1 1 0 1 0-2 0v2H7a1 1 0 0 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2V7Z" clipRule="evenodd" />
              </svg> */}
              {/* Currently we are only supporting mobile for Navigation/Win Completion */}
              {isSmallScreen()
                ? <OverlayLayout
                  currentDate={currentDate}
                  setNewDate={setCurrentDate}
                  currentStreak={currentStreak}
                  longestStreak={longestStreak}
                  //@ts-ignore-error TODO: resolve type inequalities here
                  workingWinDataForOrbit={workingWinDataForOrbit}
                  handleUpdateWorkingWins={handleUpdateWorkingWins}
                  handlePersistWins={handlePersistWins}
                  orbitFrequency={currentOrbitDetails?.frequency || 1.0}
                  orbitSiblings={orbitSiblings}
                  orbitDescendants={orbitDescendants}
                  numberOfLeafOrbitDescendants={numberOfLeafOrbitDescendants}
                  isLeafOrbit={!!currentOrbitIsLeaf}
                  currentOrbitDetails={currentOrbitDetails}
                  actions={consolidatedActions}
                ></OverlayLayout>
                : null
              }

              {/* Modal, primarily for appending/prepending new nodes to the hierarchy from the Vis */}
              {VisModal<T>(
                isModalOpen,
                setIsModalOpen,
                selectedSphere,
                currentParentOrbitEh,
                currentChildOrbitEh,
                resetModalParentChildStates,
                setIsAppendingNode,
                currentVis,
              )}
            </>
          );
        }}
      ></Component>
    );


    // ## -- Helpers for generating flags and actions for Hierarchy traversal are left in function scope to simplify, since they are not currently to be used elsewhere -- ##

    function generateNavigationFlags(
      currentVis: T,
      currentId: ActionHashB64,
      rootId: string,
      children: Array<HierarchyNode<NodeContent>>,
      x: number,
      y: number,
      maxBreadth: number,
      maxDepth: number
    ) {
      const canMove = !isSmallScreen() || currentVis.coverageType == VisCoverage.CompleteSphere;
      const canMoveLeft = canMove && rootId !== currentId && children && children[0] && children[0].data.content !== currentId;
      const canMoveRight = canMove && rootId !== currentId && children && children[children.length - 1] && children[children.length - 1].data.content !== currentId;
      const currentOrbitIsRoot = currentId === rootId;
      const hasOneChild = children && children.length == 1;
      const canTraverseDownMiddle = !!(
        children &&
        children
          ?.filter((child) => child.children && child.children.length > 0).map(node => node.data.content)
          .includes(currentId)
      );

      return {
        canMove,
        canMoveUp: canMove && rootId !== currentId,
        canTraverseUp: y !== 0,
        canMoveRight,
        canMoveLeft,
        canMoveDown: canMove && currentOrbitIsRoot && children?.length > 0,
        canMoveDownLeft: canMove && currentOrbitIsRoot && children && !hasOneChild,
        canMoveDownRight: canMove && currentOrbitIsRoot && children && !hasOneChild,
        canTraverseDownMiddle,
        canTraverseDown: children && hasOneChild && children[0].children && children[0].children.length == 1,
        canTraverseLeft: x !== 0 && currentOrbitIsRoot,
        canTraverseRight: currentOrbitIsRoot && maxBreadth && x < maxBreadth,
        canTraverseDownLeft: !canMoveLeft && !currentOrbitIsRoot && children && !hasOneChild && children[0]?.children,
        canTraverseDownRight: !canMoveRight && !currentOrbitIsRoot && maxDepth && y < maxDepth && children && !hasOneChild &&
          !!children?.find(
            (child) => child?.data?.content == currentId && !!child.children,
          ),
      };
    }

    function generateNavigationActions(
      currentVis: T,
      currentId: ActionHashB64,
      rootId: string,
      children: Array<HierarchyNode<NodeContent>>,
      currentDetails: OrbitNodeDetails | null,
      store: StoreType,
    ) {
      return {
        moveToId: (newIndex) => {
          if (typeof newIndex !== 'number') return console.error("Cannot move without valid index ");
          store.set(currentOrbitIdAtom, children[newIndex].data.content);
        },
        moveLeft: () => {
          const currentIndex = children?.findIndex(
            (child) => child.data.content == currentId,
          ) as number;
          if (currentIndex == -1) return console.error("Couldn't calculate new index to move to")
          const newId = (children![currentIndex - 1] as any).data.content;
          store.set(currentOrbitIdAtom, newId);
        },
        moveRight: () => {
          const currentIndex = children?.findIndex(
            (child) => child.data.content == currentId,
          ) as number;
          if (currentIndex == -1) return console.error("Couldn't calculate new index to move to")
          const newId = (children![currentIndex + 1] as any).data.content;
          store.set(currentOrbitIdAtom, newId);
        },
        traverseRight: () => {
          console.log('Traversing right...')
          incrementBreadth();
        },
        traverseLeft: () => {
          console.log('Traversing left...')
          decrementBreadth();
        },
        traverseDown: () => {
          console.log('Traversing down...')
          const grandChildren = children?.find(child => child.data.content == currentId)?.children;
          const currentRenderSiblingIndex = children?.findIndex(child => child.data.content == currentId);

          if (grandChildren && grandChildren.length > 0) {
            const newId = grandChildren[0].data.content;
            try {
              (currentVis?.eventHandlers.memoizedhandleNodeZoom.call(currentVis, newId, undefined) as any)
                .on("end", () => {
                  incrementDepth();

                  const newChild =
                    children &&
                    ((
                      children?.find(
                        (child) => child?.data?.content == currentId && !!child.children,
                      ) as HierarchyNode<NodeContent>
                    )?.children?.[0] as HierarchyNode<NodeContent>);
                  const newId = newChild && newChild.parent?.data?.content;
                  store.set(newTraversalLevelIndexId, { id: newId, direction: 'down', previousRenderSiblingIndex: currentRenderSiblingIndex });
                  setBreadthIndex(0);
                });
            } catch (error) {
              console.log('Could not complete zoom and traverse action.');
            }
          }
        },

        traverseUp: () => {
          decrementDepth();
          console.log('Traversing up... :>> ');
          store.set(newTraversalLevelIndexId, {
            id: currentDetails?.parentEh,
            intermediateId: currentDetails?.id,
            direction: 'up'
          });
        },

        moveDown: (id: EntryHashB64) => {
          // TODO: reinstate traversal down when stable
          // const newId = (children![0] as any).data.content; // Always move to the start of the next level, not the middle
          store.set(currentOrbitIdAtom, id);

          // console.log("Moving down... to", newId)
        },

        moveUp: () => {
          const orbit = store.get(currentOrbitDetailsAtom);
          const newId = (!!orbit && orbit?.parentEh !== rootId) ? orbit?.parentEh : rootId;
          store.set(currentOrbitIdAtom, newId);
          (currentVis as any)._lastRenderParentId = newId;
          console.log("Moving up... to", newId)
        }
      };
    }

    function getActionsAndDataForControls(currentVis: T, currentId: EntryHashB64) {
      // Determine current vis render-specific data and context
      const rootId = currentVis.rootData!.data.content;

      const children = (((currentVis.rootData!.find(node => node.data.content == currentId)?.parent?.children || currentVis.rootData?.children) as Array<HierarchyNode<NodeContent>>) || []).sort(byStartTime);
      const sphereNodeDetails = store.get(currentSphereOrbitNodeDetailsAtom);
      const orbitSiblings: Array<OrbitDescendant> = (currentId == rootId ? [currentVis.rootData] : children).map(node => {
        const orbitInfo = sphereNodeDetails[node!.data.content];
        return {
          id: orbitInfo.id,
          eH: orbitInfo.eH,
          orbitName: orbitInfo.name,
          orbitScale: orbitInfo.scale,
        }
      })

      const orbitDescendants: Array<OrbitDescendant> = [];
      if (!!currentOrbitDetails?.eH) {
        calculateFullLineage(currentOrbitDetails.eH);
        allFirstChildDescendantOrbits.current = orbitDescendants;
      }
      // Generate a full range of conditions/actions that could be fed into mob/desktop vis control components
      const flags = generateNavigationFlags(
        currentVis,
        currentId,
        rootId,
        children,
        currentHierarchyIndices.x,
        currentHierarchyIndices.y,
        maxBreadth,
        maxDepth
      );
      const actions = generateNavigationActions(
        currentVis,
        currentId,
        rootId,
        children,
        currentOrbitDetails,
        store,
      );
      // Consolidate down into 4 directions for the mobile control overlay
      const consolidatedFlags: ConsolidatedFlags = {
        canGoUp: !!(flags.canMoveUp || flags.canTraverseUp),
        canGoDown: !!(flags.canMoveDown || flags.canTraverseDownMiddle || flags.canTraverseDownLeft),
        canGoLeft: !!(flags.canMoveLeft || flags.canTraverseLeft),
        canGoRight: !!(flags.canMoveRight || flags.canTraverseRight),
      };
      const consolidatedActions: ConsolidatedActions = {
        goLeft: actions.moveToId as any,//actions.traverseLeft,
        goRight: actions.moveToId as any, //flags.canMoveRight ? actions.moveRight : actions.moveRight,
        goUp: flags.canMoveUp ? actions.moveUp as any : actions.moveUp,// actions.traverseUp,
        goDown: flags.canMoveDown ? actions.moveDown as any : actions.moveDown //actions.traverseDown,
      };

      return {
        consolidatedFlags,
        consolidatedActions,
        orbitSiblings,
        orbitDescendants: allFirstChildDescendantOrbits.current
      }


      function calculateFullLineage(currentOrbitEh: EntryHashB64) {
        const ancestorLineage: Array<OrbitDescendant> = [];

        // Step 1: Build ancestor chain
        let currentNode = currentOrbitDetails;
        while (currentNode && currentNode.parentEh) {
          const parentInfo = store.get(getOrbitNodeDetailsFromEhAtom(currentNode.parentEh));
          ancestorLineage.push({
            id: parentInfo.id,
            eH: parentInfo.eH,
            orbitName: parentInfo.name,
            orbitScale: parentInfo.scale,
          });
          currentNode = store.get(getOrbitNodeDetailsFromEhAtom(currentNode.parentEh));
        }

        // Add ancestors in reverse order (top to bottom)
        orbitDescendants.push(...ancestorLineage.reverse());

        // Step 2: Add current orbit
        const currentOrbitInfo = store.get(getOrbitNodeDetailsFromEhAtom(currentOrbitEh));
        orbitDescendants.push({
          id: currentOrbitInfo.id,
          eH: currentOrbitInfo.eH,
          orbitName: currentOrbitInfo.name,
          orbitScale: currentOrbitInfo.scale,
        });

        // Step 3: Add descendants following first-child path
        const currentVisNode = currentVis!.rootData!.find(node => node.data.content === currentOrbitEh);
        if (currentVisNode && currentVisNode.children && currentVisNode.children.length > 0) {
          addFirstChildLineage(currentVisNode.children[0]);
        }
      }

      function addFirstChildLineage(node: HierarchyNode<NodeContent>) {
        const orbitInfo = store.get(getOrbitNodeDetailsFromEhAtom(node.data.content));
        orbitDescendants.push({
          id: orbitInfo.id,
          eH: orbitInfo.eH,
          orbitName: orbitInfo.name,
          orbitScale: orbitInfo.scale,
        });

        if (node.children && node.children.length > 0) {
          addFirstChildLineage(node.children[0]);
        }
      }
    }
  })
  //@ts-ignore
  return <ComponentWithVis />;
}
