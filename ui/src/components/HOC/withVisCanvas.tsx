import React, { ComponentType, ReactNode, useCallback, useEffect, useRef, useState } from "react";

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
  currentSphereOrbitNodeDetailsAtom,
  getOrbitNodeDetailsFromEhAtom,
} from "../../state/orbit";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { store } from "../../state/store";
import { Frequency, OrbitNodeDetails, SphereHashes, WinData } from "../../state/types";
import VisModal from "../VisModal";
import TraversalButton from "../navigation/TraversalButton";
import { OverlayLayout, VisControls } from "habit-fract-design-system";
import { currentDayAtom } from "../../state/date";
import { appendSvg, byStartTime, debounce, getCanvasDimensions, isSmallScreen } from "../vis/helpers";
import { currentSphereHashesAtom } from "../../state/sphere";
import { HierarchyNode } from "d3-hierarchy";
import {
  SphereHierarchyBounds,
  HierarchyBounds,
  Coords,
  NodeContent,
} from "../../state/types/hierarchy";
import { Scale, useGetWinRecordForOrbitForMonthQuery, useCreateWinRecordMutation, useUpdateWinRecordMutation } from "../../graphql/generated";
import { useAtom, useAtomValue } from "jotai";
import { isMoreThenDaily, toYearDotMonth } from "../vis/tree-helpers";
import { useVisCanvas } from "../../hooks/useVisCanvas";
import TraversalButtons from "../navigation/TraversalButtons";
import { DEFAULT_MARGINS } from "../vis/constants";

export function withVisCanvas<T extends IVisualization>(
  Component: ComponentType<VisProps<T>>,
): ReactNode {
  const ComponentWithVis = React.memo(() => {
    // Get the details of the current Orbit's context which will trigger re-rerenders of the Vis OverlayLayout/controls
    const currentOrbitDetails: OrbitNodeDetails | null = useAtomValue(currentOrbitDetailsAtom);

    // Get the hashes of the current Sphere's context and use it as a useEffect dependency for appending the SVG canvas.
    const selectedSphere: SphereHashes = store.get(currentSphereHashesAtom);
    const { appendedSvg } = useVisCanvas(selectedSphere);

    const allFirstChildDescendantOrbits = useRef<any>(null);

    const [currentParentOrbitEh, setCurrentParentOrbitEh] =
      useState<EntryHashB64>();
    const [currentChildOrbitEh, setCurrentChildOrbitEh] =
      useState<EntryHashB64>();

    // console.log('VIS CONTEXT: ', selectedSphere, currentOrbitDetails);

    const { canvasHeight, canvasWidth } = getCanvasDimensions();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const sphereHierarchyBounds: SphereHierarchyBounds = store.get(
      currentSphereHierarchyBounds,
    );
    const currentHierarchyIndices: Coords = store.get(
      currentSphereHierarchyIndices,
    );

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

    // Store and update date in local component state to ensure re-render with VisControls, Calendar
    const [currentDate, setCurrentDate] = useAtom(currentDayAtom);
    useEffect(() => {
      const unsubscribe = store.sub(currentDayAtom, () => {
        setCurrentDate(store.get(currentDayAtom));
      });
      return unsubscribe;
    }, []);
    // Source chain queries and mutation parameters/handlers
    const currentYearDotMonth = toYearDotMonth(currentDate.toLocaleString());
    const skipFlag: boolean = (currentOrbitDetails == null || !currentOrbitDetails?.eH);
    const { data, loading, error, refetch } = useGetWinRecordForOrbitForMonthQuery({
      variables: { params: { yearDotMonth: currentYearDotMonth, orbitEh: currentOrbitDetails?.eH as EntryHashB64 } },
      skip: skipFlag
    });
    const [createOrUpdateWinRecord, { data: createOrUpdateWinRecordResponse, loading: createOrUpdateWinRecordLoading, error: createOrUpdateWinRecordError }] = useCreateWinRecordMutation();

    // Store and update currentOrbit working win data to ensure re-render with VisControls, Calendar
    useEffect(() => {
      if (!currentOrbitDetails) return;
      // Reset working win data
      setWorkingWinDataForOrbit(null);
      // Fetch new win data for the current orbit
      if (!skipFlag) {
        refetch({ params: { yearDotMonth: currentYearDotMonth, orbitEh: currentOrbitDetails?.eH as EntryHashB64 } });
      }
    }, [currentOrbitDetails?.eH]);

    const [workingWinDataForOrbit, setWorkingWinDataForOrbit] = useState<WinData<Frequency.Rationals> | null>(null);

    useEffect(() => {
      if (currentOrbitDetails == null || !data?.getWinRecordForOrbitForMonth) return;

      const newWinData = data.getWinRecordForOrbitForMonth.winData.reduce((acc: any, { date, value: val }: any) => {
        acc[date] = ("single" in val ? val.single : val.multiple);
        return acc;
      }, {});
      setWorkingWinDataForOrbit(newWinData);
    }, [data]);

    const handleUpdateWorkingWins = useCallback((newWinCount: number) => {
      if (workingWinDataForOrbit == null || currentOrbitDetails == null) return;

      setWorkingWinDataForOrbit(prevData => ({
        ...prevData,
        [currentDate.toLocaleString()]: currentOrbitDetails.frequency > 1
          ? Array(currentOrbitDetails.frequency).fill(false).map((_, i) => i < newWinCount)
          : !!newWinCount
      }));
    }, [workingWinDataForOrbit, currentOrbitDetails, currentDate]);

    const handlePersistWins = useCallback(() => {
      if (!currentOrbitDetails?.eH || !currentOrbitDetails?.frequency || !workingWinDataForOrbit) {
        console.error("Not enough details to persist.");
        return;
      }

      // Check if the current orbit is a leaf (you'll need to implement this logic)
      if (isLeafOrbit(currentOrbitDetails)) {
        createOrUpdateWinRecord({
          variables: {
            winRecord: {
              orbitEh: currentOrbitDetails.eH,
              winData: Object.entries(workingWinDataForOrbit).map(([date, value]) => ({
                date,
                ...(isMoreThenDaily(currentOrbitDetails.frequency)
                  ? { multiple: value }
                  : { single: value })
              }))
            }
          }
        });
      } else {
        console.log("Current orbit is not a leaf. Wins will be calculated from child nodes.");
      }
    }, [currentOrbitDetails, workingWinDataForOrbit, createOrUpdateWinRecord]);

    useEffect(() => {
      if (currentOrbitDetails == null || !currentDate) return;

      setWorkingWinDataForOrbit(prevData => {
        if (!prevData || !(currentDate.toLocaleString() in prevData)) {
          return {
            ...prevData,
            [currentDate.toLocaleString()]: isMoreThenDaily(currentOrbitDetails.frequency)
              ? new Array(currentOrbitDetails.frequency).fill(false)
              : false
          };
        }
        return prevData;
      });
    }, [currentDate, currentOrbitDetails]);

    const isLeafOrbit = (orbitDetails: OrbitNodeDetails | null): boolean => {
      if (orbitDetails == null) return false
      // TODO: implement a store atom for this.
      // Implement logic to determine if the orbit is a leaf
      // For example, you might check if it has any children
      return true;
    };
    return (
      <Component
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        margin={DEFAULT_MARGINS}
        render={(currentVis: T) => {
          const {
            consolidatedFlags,
            consolidatedActions,
            orbitDescendants,
            orbitSiblings
          } = getActionsAndDataForControls(currentVis, currentOrbitDetails?.eH);

          if (appendedSvg) {
            // Pass through setState handlers for the current append/prepend Node parent/child entry hashes
            currentVis.modalOpen = setIsModalOpen;
            currentVis.modalParentOrbitEh = setCurrentParentOrbitEh;
            currentVis.modalChildOrbitEh = setCurrentChildOrbitEh;

            // Trigger the Vis object render function only once the SVG is appended to the DOM
            currentVis?.render();
          }
          return (
            <>
              {/* {<currentVis.coverageType !== VisCoverage.Partial && <svg className="fixed text-white top-1 right-1 w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M21.707 21.707a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.414l3.5 3.5a1 1 0 0 1 0 1.414ZM2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm9-3a1 1 0 1 0-2 0v2H7a1 1 0 0 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2V7Z" clipRule="evenodd" />
                </svg>
                }> */}
              {isSmallScreen()
                ? <OverlayLayout
                  currentDate={currentDate}
                  setNewDate={setCurrentDate}
                  currentStreak={1}
                  workingWinDataForOrbit={workingWinDataForOrbit}
                  currentWins={workingWinDataForOrbit}
                  handleUpdateWorkingWins={handleUpdateWorkingWins}
                  handlePersistWins={handlePersistWins}
                  orbitFrequency={currentOrbitDetails?.frequency || 1.0}
                  orbitSiblings={orbitSiblings}
                  orbitDescendants={orbitDescendants}
                  isLeafOrbit={isLeafOrbit(currentOrbitDetails)}
                  currentOrbitDetails={currentOrbitDetails}
                  actions={consolidatedActions}
                ></OverlayLayout>
                : null
              }

              {VisModal<T>(
                isModalOpen,
                setIsModalOpen,
                selectedSphere,
                currentParentOrbitEh,
                currentChildOrbitEh,
                currentVis,
              )}
            </>
          );
        }}
      ></Component>
    );

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
      children: Array<HierarchyNode<any>>,
      currentDetails: any,
      store: any,
    ) {
      return {
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
                      ) as HierarchyNode<any>
                    )?.children?.[0] as HierarchyNode<any>);
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
            intermediateId: currentDetails.id,
            direction: 'up'
          });
        },

        moveDown: () => {
          const newId = (children![0] as any).data.content; // Always move to the start of the next level, not the middle
          store.set(currentOrbitIdAtom, newId);

          console.log("Moving down... to", newId)
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

    function getActionsAndDataForControls(currentVis: T, currentId?: EntryHashB64) {
      // Determine current vis render-specific data and context
      const rootId = currentVis.rootData.data.content;
      const children = (((currentVis.rootData?.children) as Array<HierarchyNode<any>>) || []).sort(byStartTime);
      const sphereNodeDetails = store.get(currentSphereOrbitNodeDetailsAtom);
      const orbitSiblings = (currentId == rootId ? [currentVis.rootData] : children).map(node => {
        const orbitInfo = sphereNodeDetails[node.data.content];
        return {
          orbitName: orbitInfo.name,
          orbitScale: orbitInfo.scale,
          handleOrbitSelect: () => console.log("orbit selected")
        }
      })
      const orbitDescendants: Array<{ orbitName: string, orbitScale: Scale }> = [];
      if (allFirstChildDescendantOrbits.current == null && currentOrbitDetails?.eH == rootId && currentVis.rootData) {
        getFirstDescendantLineage(currentVis.rootData);
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
      const consolidatedFlags = {
        canGoUp: !!(flags.canMoveUp || flags.canTraverseUp),
        canGoDown: !!(flags.canMoveDown || flags.canTraverseDownMiddle || flags.canTraverseDownLeft),
        canGoLeft: !!(flags.canMoveLeft || flags.canTraverseLeft),
        canGoRight: !!(flags.canMoveRight || flags.canTraverseRight),
      };
      const consolidatedActions = {
        moveLeft: flags.canMoveLeft ? actions.moveLeft : actions.traverseLeft,
        moveRight: flags.canMoveRight ? actions.moveRight : actions.traverseRight,
        moveUp: flags.canMoveUp ? actions.moveUp : actions.traverseUp,
        moveDown: flags.canMoveDown ? actions.moveDown : actions.traverseDown,
      };

      return {
        consolidatedFlags,
        consolidatedActions,
        orbitSiblings,
        orbitDescendants: allFirstChildDescendantOrbits.current
      }

      function getFirstDescendantLineage(node: HierarchyNode<NodeContent>) {
        // Add the current node to the lineage
        const orbitInfo = store.get(getOrbitNodeDetailsFromEhAtom(node.data.content))
        orbitDescendants.push({
          orbitName: orbitInfo.name,
          orbitScale: orbitInfo.scale,
        } as any);

        // If this node has children, traverse to the first child
        if (node.children && node.children.length > 0) {
          getFirstDescendantLineage(node.children[0]);
        }
      }
    }
  })
  //@ts-ignore
  return <ComponentWithVis />;
}
