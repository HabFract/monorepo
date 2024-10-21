import React, { ComponentType, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import "../vis/vis.css";

import { Margins, VisProps, VisCoverage, IVisualization } from "../vis/types";
import { select } from "d3-selection";
import { decode } from "@msgpack/msgpack";
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
import { WithVisCanvasProps } from "../vis/types";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { store } from "../../state/store";
import { FixedLengthArray, Frequency, OrbitNodeDetails, WinData, WinState } from "../../state/types";
import VisModal from "../VisModal";
import TraversalButton from "../navigation/TraversalButton";
import { OverlayLayout, VisControls } from "habit-fract-design-system";
import { currentDayAtom } from "../../state/date";
import { byStartTime, debounce, isSmallScreen } from "../vis/helpers";
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
import { toYearDotMonth } from "../vis/tree-helpers";

const defaultMargins: Margins = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const getCanvasDimensions = function () {
  const { height, width } = document.body.getBoundingClientRect();
  const canvasHeight = height - defaultMargins.top - defaultMargins.bottom;
  const canvasWidth = width - defaultMargins.right - defaultMargins.left;

  return { canvasHeight, canvasWidth };
};

const appendSvg = (mountingDivId: string, divId: string) => {
  return (
    select(`#${divId}`).empty() &&
    select(`#${mountingDivId}`)
      .append("svg")
      .attr("id", `${divId}`)
      .attr("width", "100vw")
      .attr("data-testid", "svg")
      .attr("height", "100vh")
      .attr("style", "pointer-events: all")
  );
};

export function withVisCanvas<T extends IVisualization>(
  Component: ComponentType<VisProps<T>>,
): ReactNode {
  const ComponentWithVis = (() => {
    const mountingDivId = "vis-root";
    const svgId = "vis"; // May need to be declared dynamically when we want multiple vis on a page
    const [appendedSvg, setAppendedSvg] = useState<boolean>(false);

    const selectedSphere = store.get(currentSphereHashesAtom);
    const currentOrbitDetails: OrbitNodeDetails | null = useAtomValue(currentOrbitDetailsAtom);
    const allFirstChildDescendantOrbits = useRef<any>(null);

    const [currentParentOrbitEh, setCurrentParentOrbitEh] =
      useState<EntryHashB64>();
    const [currentChildOrbitEh, setCurrentChildOrbitEh] =
      useState<EntryHashB64>();

    // console.log('VIS CONTEXT: ', selectedSphere, currentOrbitDetails);
    useEffect(() => {
      if (document.querySelector(`#${mountingDivId} #${svgId}`)) return;
      const appended = !!appendSvg(mountingDivId, svgId);
      setAppendedSvg(appended);
    }, [selectedSphere?.actionHash]);

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
    const currentYearDotMonth = toYearDotMonth(currentDate.toLocaleString());
    const skipFlag: boolean = (currentOrbitDetails == null || !currentOrbitDetails?.eH);
    const { data, loading, error } = useGetWinRecordForOrbitForMonthQuery({ variables: { params: { yearDotMonth: currentYearDotMonth, orbitEh: currentOrbitDetails?.eH as EntryHashB64 } }, skip: skipFlag });
    const [createOrUpdateWinRecord, { data: createOrUpdateWinRecordResponse, loading: createOrUpdateWinRecordLoading, error: createOrUpdateWinRecordError }] = useCreateWinRecordMutation();
    // const [updateWinRecord, { data: updateWinRecordResponse, loading: updateWinRecordLoading, error: updateWinRecordError }] = useUpdateWinRecordMutation({ skip: skipFlag });
    console.log('decode :>> ', decode([130, 167, 111, 114, 98, 105, 116, 69, 104, 196, 39, 132, 33, 36, 229, 213, 1, 2, 210, 122, 188, 166, 32, 223, 27, 225, 192, 87, 170, 222, 26, 151, 188, 122, 185, 152, 212, 139, 12, 110, 164, 65, 115, 250, 214, 2, 6, 222, 191, 234, 167, 119, 105, 110, 68, 97, 116, 97, 129, 170, 50, 49, 47, 49, 48, 47, 50, 48, 50, 52, 130, 164, 116, 121, 112, 101, 166, 115, 105, 110, 103, 108, 101, 165, 118, 97, 108, 117, 101, 194]));
    const workingWinDataForOrbit = useMemo((): WinData<Frequency.Rationals> | null => {
      if (currentOrbitDetails == null) return null;

      if (!data?.getWinRecordForOrbitForMonth || data.getWinRecordForOrbitForMonth == null) {
        const isMoreThenDaily = (frequency: Frequency.Rationals): boolean => {
          return frequency > 1; // Simplified check, adjust according to your actual logic
        };
        const blankWinRecordForFrequency: WinData<Frequency.Rationals> = {
          [currentYearDotMonth]: isMoreThenDaily(currentOrbitDetails.frequency)
            ? new Array(currentOrbitDetails.frequency).fill(false) as FixedLengthArray<boolean, typeof currentOrbitDetails.frequency>
            : false as any,
        };

        createOrUpdateWinRecord({
          variables: {
            winRecord: {
              orbitEh: currentOrbitDetails.eH,
              winData: [{
                date: currentDate.toLocaleString(),
                ...{
                  [isMoreThenDaily(currentOrbitDetails.frequency) ? 'multiple' : 'single']: blankWinRecordForFrequency[currentYearDotMonth]
                }
              }
              ]
            }
          }
        })

        return blankWinRecordForFrequency
      }
      return null
    }, [data, currentOrbitDetails])
    console.log('workingWinDataForOrbit :>> ', workingWinDataForOrbit);
    return (
      <Component
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        margin={defaultMargins}
        selectedSphere={selectedSphere}
        coords={currentHierarchyIndices}
        render={(currentVis: T) => {
          const traversalButtons = renderTraversalButtons(
            currentHierarchyIndices,
            currentVis,
            currentOrbitDetails!
          )

          const {
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
                  currentWins={workingWinDataForOrbit}
                  persistWins={() => { console.log(workingWinDataForOrbit) }}
                  orbitFrequency={currentOrbitDetails?.frequency || 1.0}
                  orbitSiblings={orbitSiblings}
                  orbitDescendants={orbitDescendants}
                  actions={consolidatedActions}
                ></OverlayLayout>
                : <VisControls // To be phased out once desktop design work is done.
                  buttons={traversalButtons}
                />
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
      if (!currentId) {
        store.set(currentOrbitIdAtom, rootId);
        currentId = rootId;
        console.log("Set default focus node to the root...", rootId);
      }
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
        // console.log('orbitDescendants, currentId :>> ', orbitDescendants, allFirstChildDescendantOrbits.current); 
      }
      // Generate actions to be fed into mob/desktop vis control components
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
      const consolidatedActions = {} as any;
      consolidatedActions.moveLeft = flags.canMoveLeft ? actions.moveLeft : actions.traverseLeft;
      consolidatedActions.moveRight = flags.canMoveRight ? actions.moveRight : actions.traverseRight;
      consolidatedActions.moveUp = flags.canMoveUp ? actions.moveUp : actions.traverseUp;
      consolidatedActions.moveDown = flags.canMoveDown ? actions.moveDown : actions.traverseDown;

      return {
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

    function renderTraversalButtons<T extends IVisualization>(
      coords: Coords,
      currentVis: T,
      currentDetails: OrbitNodeDetails
    ) {
      const { x, y } = coords;
      const rootId = currentVis.rootData.data.content;
      let currentId = store.get(currentOrbitIdAtom)?.id as ActionHashB64;
      const children = (((currentVis.rootData?.children) as Array<HierarchyNode<any>>) || []).sort(byStartTime);

      // Calculate conditions for either moving (within current window of sphere hierarchy data) or traversing (across windows)
      const {
        canMoveUp,
        canTraverseUp,
        canMoveDown,
        canTraverseDownMiddle,
        canTraverseDownLeft,
        canTraverseLeft,
        canMoveLeft,
        canMoveRight,
        canTraverseRight,
      } = generateNavigationFlags(
        currentVis as any,
        currentId,
        rootId,
        children,
        x,
        y,
        maxBreadth,
        maxDepth
      );
      // console.table({  canMoveUp, canTraverseUp, canMoveDown, canTraverseDownMiddle, canTraverseDownLeft, canTraverseLeft, canMoveLeft, canMoveRight, canTraverseRight})

      // Consolidate move/traverse conditions such that there is only one action presented to the user for each direction
      const canGoUp = !!(canMoveUp || canTraverseUp);
      const canGoDown = !!(canMoveDown || canTraverseDownMiddle || canTraverseDownLeft);
      const canGoLeft = !!(canMoveLeft || canTraverseLeft)
      const canGoRight = !!(canMoveRight || canTraverseRight)
      // Generate actions based on the flags computed above
      const actions = generateNavigationActions(
        currentVis as any,
        currentId,
        rootId,
        children,
        currentDetails,
        store,
      );

      return [
        <TraversalButton
          condition={canGoUp}
          iconType="up"
          onClick={canMoveUp ? actions.moveUp : actions.traverseUp}
          dataTestId="vis-go-up"
        />,
        <TraversalButton
          condition={canGoDown}
          iconType="down"
          onClick={canMoveDown ? actions.moveDown : actions.traverseDown}
          dataTestId="vis-go-down"
        />,
        <TraversalButton
          condition={canGoLeft}
          iconType="left"
          onClick={canMoveLeft ? actions.moveLeft : actions.traverseLeft}
          dataTestId="vis-go-left"
        />,
        <TraversalButton
          condition={canGoRight}
          iconType="right"
          onClick={canMoveRight ? actions.moveRight : actions.traverseRight}
          dataTestId="vis-go-right"
        />,
      ];
    };
  })
  //@ts-ignore
  return <ComponentWithVis />;
}
