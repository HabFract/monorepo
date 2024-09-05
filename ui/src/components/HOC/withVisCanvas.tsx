import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "../vis/vis.css";

import { Margins, VisProps, VisCoverage, IVisualization } from '../vis/types';
import { select } from "d3-selection";
import { useAtomValue } from 'jotai';
import { useNodeTraversal } from '../../hooks/useNodeTraversal';
import { HierarchyBounds, SphereHashes, SphereHierarchyBounds, currentSphere, currentSphereHierarchyBounds } from '../../state/currentSphereHierarchyAtom';

import { currentOrbitDetails, currentOrbitId, setOrbit } from '../../state/orbit';
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

const defaultMargins: Margins = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 60,
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
      setBreadthIndex,
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

            // console.log('coordsChanged! :>> ', currentVis?._nextRootData?._translationCoords);
            if (appendedSvg) {
              // currentVis.isModalOpen = false;
              // Pass through setState handlers for the current append/prepend Node parent/child entry hashes
              currentVis.modalOpen = setIsModalOpen;
              currentVis.modalParentOrbitEh = setCurrentParentOrbitEh;
              currentVis.modalChildOrbitEh = setCurrentChildOrbitEh;

              // traversalConditions.onlyChildParent = currentVis.rootData.parent == null || (currentVis.rootData.parent?.children && currentVis.rootData.parent?.children.length == 1 || true);

              // Trigger the Vis object render function only once the SVG is appended to the DOM
              currentVis?.render();
            }
            return (
              <>
                <VisControls
                  currentDate={currentDate}
                  setNewDate={(val) => {console.log(val.toISODate());setCurrentDate(val)}}
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

      const currentOrbitChildren = currentVis.rootData.children;
      const children = currentVis.rootData?.children

      const moveDown = () => {
        const childrenMiddle = Math.floor(children!.length / 2)
        const newId = (children![childrenMiddle] as any).data.content;
        store.set(currentOrbitId, {id: newId})
      }
      const moveDownLeft = () => {
        const newId = (children![0] as any).data.content
        store.set(currentOrbitId, {id: newId})
      }
      const moveDownRight = () => {
        const newId = (children![children!.length - 1] as any).data.content
        store.set(currentOrbitId, {id: newId})
      }
      return [
        <TraversalButton
          condition={withTraversal && y !== 0}
          iconType="up"
          onClick={decrementDepth}
          dataTestId="traversal-button-up"
        />,
        <TraversalButton
          condition={withTraversal && x !== 0}
          iconType="left"
          onClick={decrementBreadth}
          dataTestId="traversal-button-left"
        />,
        <TraversalButton
          condition={!!(withTraversal && hasChild && !hasOneChild) }
          iconType="down-left"
          onClick={currentOrbitIsRoot ? moveDownLeft : incrementDepth}
          dataTestId="traversal-button-down-left"
        />,
        <TraversalButton
          condition={!!(withTraversal && maxBreadth && x < maxBreadth)}
          iconType="right"
          onClick={incrementBreadth}
          dataTestId="traversal-button-right"
        />,
        <TraversalButton
          condition={withTraversal && hasChild && hasOneChild || (currentOrbitIsRoot && hasChild && currentOrbitChildren!.length > 1)}
          iconType="down"
          onClick={currentOrbitIsRoot ? moveDown : incrementDepth}
          dataTestId="traversal-button-down"
        />,
        <TraversalButton
          condition={!!((withTraversal && maxDepth && y < maxDepth && !onlyChildParent)|| (currentOrbitIsRoot && hasChild && currentOrbitChildren!.length > 1))}
          iconType="down-right"
          onClick={currentOrbitIsRoot ? moveDownRight : () => { incrementDepth(); setBreadthIndex(currentVis.rootData.data.children.length - 1); }}
          dataTestId="traversal-button-down-right"
        />
      ];
    };
  }
  //@ts-ignore
  return <ComponentWithVis />
}

