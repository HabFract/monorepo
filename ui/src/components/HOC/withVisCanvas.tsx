import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "../vis/vis.css";

import { Margins, VisProps, VisCoverage, IVisualization } from '../vis/types';
import { select } from "d3-selection";
import { useAtomValue } from 'jotai';
import { useNodeTraversal } from '../../hooks/useNodeTraversal';
import { HierarchyBounds, SphereHashes, SphereHierarchyBounds, currentSphere, currentSphereHierarchyBounds } from '../../state/currentSphereHierarchyAtom';

import { currentOrbitCoords, currentOrbitDetails, currentOrbitId, setOrbit } from '../../state/orbit';
import { WithVisCanvasProps } from '../vis/types';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { OrbitNodeDetails, SphereNodeDetailsCache, SphereOrbitNodes, store } from '../../state/jotaiKeyValueStore';
import VisModal from '../VisModal';
import TraversalButton from '../navigation/TraversalButton';
import { VisControls } from 'habit-fract-design-system';
import { currentDayAtom } from '../../state/date';
import { isSmallScreen } from '../vis/helpers';
import { useRedirect } from '../../hooks/useRedirect';
import { sphereHasCachedNodesAtom } from '../../state/sphere';
import { HierarchyNode } from 'd3-hierarchy';
import { byStartTime } from '../vis/OrbitTree';

const defaultMargins: Margins = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 30,
};

const getCanvasDimensions = function () {
  const { height, width } = document.body.getBoundingClientRect();
  const canvasHeight = height - defaultMargins.top - defaultMargins.bottom;
  const canvasWidth = width - defaultMargins.right - defaultMargins.left;

  return { canvasHeight, canvasWidth };
};

const appendSvg = (mountingDivId: string, divId: string) => {
  return select(`#${divId}`).empty() &&
    select(`#${mountingDivId}`)
      .append("svg")
      .attr("id", `${divId}`)
      .attr("width", "100%")
      .attr("data-testid", "svg")
      .attr("height", "100%")
      .attr("style", "pointer-events: all");
};

interface TraversalButtonVisibilityConditions {
  withTraversal: boolean; // Top level flag
  hasChild: boolean;
  hasOneChild: boolean;
  onlyChildParent: boolean;
}

function getTraversalConditions(queryType: VisCoverage, newRootData: any): TraversalButtonVisibilityConditions {
  const withTraversal: boolean = queryType !== VisCoverage.CompleteOrbit;
  const hasChild: boolean = newRootData?.data?.children && newRootData?.data?.children.length > 0;
  const hasOneChild: boolean = newRootData?.data?.children && newRootData?.data?.children.length == 1;
  const onlyChildParent: boolean = true;

  return { withTraversal, hasChild, hasOneChild, onlyChildParent };
}

type Coordinates = {
  x: number;
  y: number;
}

function coordsChanged(translationCoords, x, y): boolean {
  if (typeof translationCoords == 'undefined') return false
  return translationCoords[0] !== x || translationCoords[1] !== y
}

export function withVisCanvas<T extends IVisualization>(Component: ComponentType<VisProps<T>>): ReactNode {
  const ComponentWithVis: React.FC<WithVisCanvasProps> = (_visParams: WithVisCanvasProps) => {
    const hasOrbits = useAtomValue(sphereHasCachedNodesAtom);
    useRedirect(hasOrbits);

    const mountingDivId = 'vis-root'; // Declared at the router level
    const svgId = 'vis'; // May need to be declared dynamically when we want multiple vis on a page
    const [appendedSvg, setAppendedSvg] = useState<boolean>(false);
    const selectedSphere = store.get(currentSphere);
    const cachedCurrentOrbit: OrbitNodeDetails | undefined = useAtomValue(currentOrbitDetails);

    useEffect(() => {
      if (document.querySelector(`#${mountingDivId} #${svgId}`)) return
      const appended = !!appendSvg(mountingDivId, svgId);
      setAppendedSvg(appended)
    }, [selectedSphere.actionHash]);

    const { canvasHeight, canvasWidth } = getCanvasDimensions()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentParentOrbitEh, setCurrentParentOrbitEh] = useState<EntryHashB64>();
    const [currentChildOrbitEh, setCurrentChildOrbitEh] = useState<EntryHashB64>();

    const sphereHierarchyBounds: SphereHierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
    const { incrementBreadth,
      decrementBreadth,
      incrementDepth,
      decrementDepth,
      maxBreadth,
      setBreadthEnd,
      maxDepth
    } = useNodeTraversal(sphereHierarchyBounds[selectedSphere!.entryHash as keyof SphereHierarchyBounds] as HierarchyBounds);

    // Store and update date in local component state to ensure re-render with VisControls, Calendar
    const [currentDate, setCurrentDate] = useState(store.get(currentDayAtom));
    store.sub(currentDayAtom, () => {
      setCurrentDate(store.get(currentDayAtom))
    });
    return (
      <Component
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        margin={defaultMargins}
        selectedSphere={selectedSphere}
        render={(currentVis: T, queryType: VisCoverage, x, y, newRootData) => {
          const currentOrbitIsRoot = cachedCurrentOrbit && cachedCurrentOrbit.eH === currentVis.rootData.data.content;
          // Determine need for traversal controls
          const traversalConditions = getTraversalConditions(queryType, currentOrbitIsRoot ? currentVis.rootData : newRootData);

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
                setNewDate={(val) => { setCurrentDate(val) }}
                orbitDetails={cachedCurrentOrbit}
                setOrbitDetailsWin={(dateIndex: string, newValue: boolean) => {
                  store.set(setOrbit, {
                    orbitEh: cachedCurrentOrbit!.eH as string,
                    update: {
                      ...cachedCurrentOrbit,
                      wins: {
                        ...cachedCurrentOrbit!.wins,
                        [dateIndex]: newValue
                      }
                    }
                  })
                }}
                buttons={renderTraversalButtons(traversalConditions, { x, y }, currentVis, currentOrbitIsRoot)}
              />
              {VisModal<T>(isModalOpen, setIsModalOpen, selectedSphere, currentParentOrbitEh, currentChildOrbitEh, currentVis)}
            </>
          )
        }}
      ></Component>
    );

    function renderTraversalButtons<T extends IVisualization>(
      conditions: TraversalButtonVisibilityConditions,
      coords: Coordinates,
      currentVis: T,
      currentOrbitIsRoot: boolean
    ) {
      const { withTraversal, hasChild, hasOneChild, onlyChildParent } = conditions;
      const { x, y } = coords;
      const data = (currentVis.rootData as HierarchyNode<any>).sort(byStartTime);
      const children = (isSmallScreen() ? data?.children?.reverse() : data?.children) as Array<HierarchyNode<any>> | undefined;
      const rootId = data.data.content;
      const currentId = store.get(currentOrbitId)?.id as ActionHashB64;

      const canMove = !isSmallScreen() || (currentVis.coverageType == VisCoverage.CompleteSphere);
      const canMoveUp = canMove && rootId !== currentId;
      const canMoveRight = canMove && canMoveUp && children && children[children.length - 1].data.content !== currentId;
      const canMoveLeft = canMove && canMoveUp && children && children[0].data.content !== currentId;
      const canMoveDown = canMove && currentOrbitIsRoot && children && children.length !== 2;
      const canMoveDownLeft = canMove && currentOrbitIsRoot && children && !hasOneChild;
      const canMoveDownRight = canMove && currentOrbitIsRoot && children && !hasOneChild;

      const canTraverseDown = children && hasOneChild && children[0].children && children[0].children.length == 1;
      const canTraverseLeft = x !== 0 && currentOrbitIsRoot;
      const canTraverseRight = currentOrbitIsRoot && maxBreadth && x < maxBreadth;
      const canTraverseDownLeft = !currentOrbitIsRoot && children && !hasOneChild && children[0].children;
      const canTraverseDownRight = !currentOrbitIsRoot && maxDepth && (y < maxDepth) && children && !hasOneChild && children[children.length - 1].children;

      const moveLeft = () => {
        const currentIndex = children?.findIndex(child => child.data.content == currentId) as number;
        const newId = (children![currentIndex - 1] as any).data.content;
        store.set(currentOrbitId, { id: newId })
      }
      const moveRight = () => {
        const currentIndex = children?.findIndex(child => child.data.content == currentId) as number;
        const newId = (children![currentIndex + 1] as any).data.content;
        store.set(currentOrbitId, { id: newId })
      }
      const moveDown = () => {
        const childrenMiddle = Math.floor(children!.length / 2)
        const newId = (children![childrenMiddle] as any).data.content;
        store.set(currentOrbitId, { id: newId })
      }
      const moveUp = () => {
        const newId = rootId;
        store.set(currentOrbitId, { id: newId })
      }
      const moveDownLeft = () => {
        const newId = (children![0] as any).data.content
        store.set(currentOrbitId, { id: newId })
      }
      const moveDownRight = () => {
        const newId = (children![children!.length - 1] as any).data.content
        store.set(currentOrbitId, { id: newId })
      }
      return [
        <TraversalButton
          condition={withTraversal && (y !== 0 || canMoveUp)}
          iconType="up"
          onClick={canMoveUp ? moveUp : decrementDepth}
          dataTestId="traversal-button-up"
        />,
        <TraversalButton
          condition={!!(withTraversal && (canTraverseDown || canMoveDown))}
          iconType="down"
          onClick={canMoveDown ? moveDown : incrementDepth}
          dataTestId="traversal-button-down"
        />,
        <TraversalButton
          condition={!!(withTraversal && (canTraverseLeft || canMoveLeft))}
          iconType="left"
          onClick={canMoveLeft ? moveLeft : decrementBreadth}
          dataTestId="traversal-button-left"
        />,
        <TraversalButton
          condition={!!(withTraversal && (canTraverseDownLeft || canMoveDownLeft))}
          iconType="down-left"
          onClick={canMoveDownLeft ? moveDownLeft : incrementDepth}
          dataTestId="traversal-button-down-left"
        />,
        <TraversalButton
          condition={!!(withTraversal && (canTraverseRight || canMoveRight))}
          iconType="right"
          onClick={canMoveRight ? moveRight : incrementBreadth}
          dataTestId="traversal-button-right"
        />,
        <TraversalButton
          condition={!!(withTraversal && (canTraverseDownRight || canMoveDownRight))}
          iconType="down-right"
          onClick={canMoveDownRight ? moveDownRight : () => {
            const newX = children!.length - 1; const newY = incrementDepth(); setBreadthEnd(newX); setTimeout(() => {
              store.set(currentOrbitCoords, { x: newX, y: newY as number })
            }, 250);
          }}
          dataTestId="traversal-button-down-right"
        />
      ];
    };
  }
  //@ts-ignore
  return <ComponentWithVis />
}

