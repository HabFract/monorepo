import React, { ComponentType, ReactNode, useEffect, useState } from "react";

import "../vis/vis.css";

import { Margins, VisProps, VisCoverage, IVisualization } from "../vis/types";
import { select } from "d3-selection";
import { useNodeTraversal } from "../../hooks/useNodeTraversal";
import {
  currentSphereHierarchyBounds,
  newTraversalLevelIndexId,
} from "../../state/hierarchy";

import {
  currentOrbitDetailsAtom,
  currentOrbitIdAtom,
  setOrbitWithEntryHashAtom,
} from "../../state/orbit";
import { WithVisCanvasProps } from "../vis/types";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { store } from "../../state/jotaiKeyValueStore";
import { OrbitNodeDetails } from "../../state/types";
import VisModal from "../VisModal";
import TraversalButton from "../navigation/TraversalButton";
import { VisControls } from "habit-fract-design-system";
import { currentDayAtom } from "../../state/date";
import { byStartTime, isSmallScreen } from "../vis/helpers";
import { useRedirect } from "../../hooks/useRedirect";
import { currentSphereHashesAtom } from "../../state/sphere";
import { HierarchyNode } from "d3-hierarchy";
import {
  SphereHierarchyBounds,
  HierarchyBounds,
  Coords,
  NodeContent,
} from "../../state/types/hierarchy";

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
  const ComponentWithVis: React.FC<WithVisCanvasProps> = (
    _visParams: WithVisCanvasProps,
  ) => {
    useRedirect();

    const mountingDivId = "vis-root"; // Declared at the router level
    const svgId = "vis"; // May need to be declared dynamically when we want multiple vis on a page
    const [appendedSvg, setAppendedSvg] = useState<boolean>(false);
    const selectedSphere = store.get(currentSphereHashesAtom);
    const cachedCurrentOrbit: OrbitNodeDetails | null = store.get(
      currentOrbitDetailsAtom,
    );

    useEffect(() => {
      if (document.querySelector(`#${mountingDivId} #${svgId}`)) return;
      const appended = !!appendSvg(mountingDivId, svgId);
      setAppendedSvg(appended);
    }, [selectedSphere?.actionHash]);

    const { canvasHeight, canvasWidth } = getCanvasDimensions();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentParentOrbitEh, setCurrentParentOrbitEh] =
      useState<EntryHashB64>();
    const [currentChildOrbitEh, setCurrentChildOrbitEh] =
      useState<EntryHashB64>();

    const sphereHierarchyBounds: SphereHierarchyBounds = store.get(
      currentSphereHierarchyBounds,
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
    const [currentDate, setCurrentDate] = useState(store.get(currentDayAtom));
    store.sub(currentDayAtom, () => {
      setCurrentDate(store.get(currentDayAtom));
    });
    return (
      <Component
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        margin={defaultMargins}
        selectedSphere={selectedSphere}
        render={(currentVis: T, queryType: VisCoverage, x, y, newRootData) => {

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
              <VisControls
                currentDate={currentDate}
                setNewDate={(val) => {
                  setCurrentDate(val);
                }}
                orbitDetails={cachedCurrentOrbit as OrbitNodeDetails}
                setOrbitDetailsWin={(dateIndex: string, newValue: boolean) => {
                  store.set(setOrbitWithEntryHashAtom, {
                    orbitEh: cachedCurrentOrbit!.eH as string,
                    update: {
                      ...cachedCurrentOrbit,
                      // wins: {
                      //   ...cachedCurrentOrbit!.wins,
                      //   [dateIndex]: newValue
                      // }
                    },
                  });
                }}
                buttons={renderTraversalButtons(
                  { x, y },
                  currentVis,
                )}
              />
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
      const canMoveLeft = canMove && rootId !== currentId && children && children[0].data.content !== currentId;
      const canMoveRight = canMove && rootId !== currentId && children && children[children.length - 1].data.content !== currentId;
      const currentOrbitIsRoot = currentId === rootId;
      const hasOneChild = children && children.length == 1;
console.log('currentOrbitIsRoot && maxBreadth && x < maxBreadth :>> ', currentOrbitIsRoot, maxBreadth, x);
      return {
        canMove,
        canMoveUp: canMove && rootId !== currentId,
        canTraverseUp: y !== 0,
        canMoveRight,
        canMoveLeft,
        canMoveDown: canMove && currentOrbitIsRoot && children && children.length !== 2,
        canMoveDownLeft: canMove && currentOrbitIsRoot && children && !hasOneChild,
        canMoveDownRight: canMove && currentOrbitIsRoot && children && !hasOneChild,
        canTraverseDownMiddle: !!(
          children &&
          children
            .slice(1, -1)
            ?.find((child) => child.children && child.children.length > 0)?.data
            .content == currentId
        ),
        canTraverseDown: children && hasOneChild && children[0].children && children[0].children.length == 1,
        canTraverseLeft: x !== 0 && currentOrbitIsRoot,
        canTraverseRight: currentOrbitIsRoot && maxBreadth && x < maxBreadth,
        canTraverseDownLeft: !canMoveLeft && !currentOrbitIsRoot && children && !hasOneChild && children[0].children,
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
      incrementDepth: () => void,
      decrementDepth: () => void,
      setBreadthIndex: (index: number) => void
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
          if (grandChildren && grandChildren.length > 0) {
            const newId = grandChildren[0].data.content;

            currentVis?.eventHandlers.memoizedhandleNodeZoom.call(currentVis, newId, undefined)
              ?.on("end", () => {
                incrementDepth();
                const newChild =
                  children &&
                  ((
                    children?.find(
                      (child) => child?.data?.content == currentId && !!child.children,
                    ) as HierarchyNode<any>
                  )?.children?.[0] as HierarchyNode<any>);
                const newId = newChild && newChild.parent?.data?.content;
                store.set(newTraversalLevelIndexId, { id: newId, direction: 'down' });
                setBreadthIndex(0);
              });
          }
        },

        traverseUp: () => {
          decrementDepth();
          console.log('Traversing up... :>> ');
          store.set(newTraversalLevelIndexId, {
            id: currentDetails?.parentEh,
            direction: 'up'
          });
        },

        moveDown: () => {
          // const childrenMiddle =
          //   children!.length > 0 ? Math.ceil(children!.length / 2) - 1 : 0;
          const newId = (children![0] as any).data.content; // Always move to the start of the next level, not the middle
          store.set(currentOrbitIdAtom, newId);

          console.log("Moving down... to", newId)
        },

        moveUp: () => {
          const orbit = store.get(currentOrbitDetailsAtom);
          const newId = (!!orbit && orbit?.parentEh !== rootId) ? orbit?.parentEh : rootId;
          store.set(currentOrbitIdAtom, newId);

          console.log("Moving up... to", newId)
        }
      };
    }

    function renderTraversalButtons<T extends IVisualization>(
      coords: Coords,
      currentVis: T,
    ) {
      const { x, y } = coords;
      const rootId = currentVis.rootData.data.content;
      const currentDetails = store.get(currentOrbitDetailsAtom);
      let currentId = store.get(currentOrbitIdAtom)?.id as ActionHashB64;
      if (!currentId) {
        store.set(currentOrbitIdAtom, rootId);
        currentId = rootId;
        console.log("Set default focus node to the root...");
      }

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
      // Consolidate move/traverse conditions such that there is only one action presented to the user for each direction
      const canGoUp = !!(canMoveUp || canTraverseUp);
      const canGoDown = !!(canMoveDown || canTraverseDownMiddle || canTraverseDownLeft);// canMove && currentOrbitIsRoot && children && children.length > 0;
      const canGoLeft = !!(canMoveLeft || canTraverseLeft) // canMove && canGoUp && children && children[0].data.content !== currentId;
      const canGoRight = !!(canMoveRight || canTraverseRight)// canMove && canGoUp && children && children[children.length - 1].data.content !== currentId;
      // Generate actions based on the flags computed above
      const actions = generateNavigationActions(
        currentVis as any,
        currentId,
        rootId,
        children,
        currentDetails,
        store,
        incrementDepth,
        decrementDepth,
        setBreadthIndex
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
  }
  //@ts-ignore
  return <ComponentWithVis />;
}
