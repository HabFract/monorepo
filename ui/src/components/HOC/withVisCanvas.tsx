import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "../vis/vis.css";

import { Margins, VisProps, VisCoverage, IVisualization } from '../vis/types';
import { select } from "d3-selection";
import { useAtomValue } from 'jotai';
import { useNodeTraversal } from '../../hooks/useNodeTraversal';
import { HierarchyBounds, SphereHashes, SphereHierarchyBounds, currentSphere, currentSphereHierarchyBounds } from '../../state/currentSphereHierarchyAtom';

import { currentOrbitDetails, setOrbit } from '../../state/orbit';
import { WithVisCanvasProps } from '../vis/types';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { OrbitNodeDetails, store } from '../../state/jotaiKeyValueStore';
import VisModal from '../VisModal';
import TraversalButton from '../navigation/TraversalButton';
import { VisControls } from 'habit-fract-design-system';
import { currentDayAtom } from '../../state/date';

const defaultMargins: Margins = {
  top: -400,
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

export function withVisCanvas<T extends IVisualization>(Component: ComponentType<VisProps<T>>): ReactNode {
  const ComponentWithVis: React.FC<WithVisCanvasProps> = (_visParams: WithVisCanvasProps) => {
    const mountingDivId = 'vis-root'; // Declared at the router level
    const svgId = 'vis'; // May need to be declared dynamically when we want multiple vis on a page
    const [appendedSvg, setAppendedSvg] = useState<boolean>(false);
    const selectedSphere = store.get(currentSphere);
    const cachedCurrentOrbit: OrbitNodeDetails | undefined = useAtomValue(currentOrbitDetails);

    if (!selectedSphere.actionHash) {
      console.error("No sphere context has been set!")
    }
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

    return (
      <>
        <Component
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          margin={defaultMargins}
          selectedSphere={selectedSphere}
          render={(currentVis: T, queryType: VisCoverage, x, y, newRootData) => {
            // Determine need for traversal controls
            const withTraversal: boolean = queryType !== VisCoverage.CompleteOrbit;
            let onlyChildParent: boolean = true;
            let hasChild: boolean = newRootData?.data?.children && newRootData?.data?.children.length > 0;
            let hasOneChild: boolean = newRootData?.data?.children && newRootData?.data?.children.length == 1;
            const dateToday = store.get(currentDayAtom);
            // console.log('coordsChanged! :>> ', currentVis?._nextRootData?._translationCoords);
            if (appendedSvg) {
              currentVis.isModalOpen = false;
              // Pass through setState handlers for the current append/prepend Node parent/child entry hashes
              currentVis.modalOpen = setIsModalOpen;
              currentVis.modalParentOrbitEh = setCurrentParentOrbitEh;
              currentVis.modalChildOrbitEh = setCurrentChildOrbitEh;

              onlyChildParent = currentVis.rootData.parent == null || (currentVis.rootData.parent?.children && currentVis.rootData.parent?.children.length == 1 || true);
              // Trigger the Vis object render function only once the SVG is appended to the DOM
              currentVis?.render();
            }

            function coordsChanged(translationCoords): boolean {
              if (typeof translationCoords == 'undefined') return false
              return translationCoords[0] !== x || translationCoords[1] !== y
            }
console.log('cachedCurrentOrbit :>> ', cachedCurrentOrbit);
            return (
              <>
                <VisControls orbitDetails={cachedCurrentOrbit} setOrbitDetailsWin={(dateIndex: string, newValue: boolean) => {
                  store.set(setOrbit, { orbitEh: cachedCurrentOrbit!.eH, update: { ...cachedCurrentOrbit, wins: { ...cachedCurrentOrbit!.wins, [dateIndex]: newValue } } })
                  const a = store.get(currentOrbitDetails);
                }} dateIndex={dateToday.toISODate()} buttons={[
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
                    condition={!!(withTraversal && hasChild && !hasOneChild)}
                    iconType="down-left"
                    onClick={incrementDepth}
                    dataTestId="traversal-button-down-left"
                  />,
                  <TraversalButton
                    condition={!!(withTraversal && maxBreadth && x < maxBreadth)}
                    iconType="right"
                    onClick={incrementBreadth}
                    dataTestId="traversal-button-right"
                  />,
                  <TraversalButton
                    condition={withTraversal && hasChild && hasOneChild}
                    iconType="down"
                    onClick={incrementDepth}
                    dataTestId="traversal-button-down"
                  />,
                  <TraversalButton
                    condition={!!(withTraversal && maxDepth && y < maxDepth && !onlyChildParent)}
                    iconType="down-right"
                    onClick={() => { incrementDepth(); setBreadthIndex(currentVis.rootData.data.children.length - 1); }}
                    dataTestId="traversal-button-down-right"
                  />]}
                />
                {VisModal<T>(isModalOpen, setIsModalOpen, selectedSphere, currentParentOrbitEh, currentChildOrbitEh, currentVis)}
              </>
            )
          }}
        ></Component>
      </>
    );
  }
  //@ts-ignore
  return <ComponentWithVis />
}

