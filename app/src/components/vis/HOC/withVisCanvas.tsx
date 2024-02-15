import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "./vis.css";

import { Margins, VisProps, VisCoverage } from '../types';
import { select } from "d3-selection";
import { useAtom, useAtomValue } from 'jotai';
import { useNodeTraversal } from '../../../hooks/useNodeTraversal';
import { HierarchyBounds, SphereHierarchyBounds, currentSphere, currentSphereHierarchyBounds } from '../../../state/currentSphereHierarchyAtom';
import { DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons';
import { WithVisCanvasProps } from '../types';
import { EntryHashB64 } from '@holochain/client';

const defaultMargins: Margins = {
  top: -1100,
  right: 0,
  bottom: 0,
  left: -30,
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

export function withVisCanvas(Component: ComponentType<VisProps>): ReactNode {
  const ComponentWithVis: React.FC<WithVisCanvasProps> = (_visParams: WithVisCanvasProps) => {
    const mountingDivId = 'vis-root'; // Declared at the router level
    const svgId = 'vis'; // May need to be declared dynamically when we want multiple vis on a page
    
    const [appendedSvg, setAppendedSvg] = useState<boolean>(false);
    useEffect(() => {
      if(document.querySelector(`#${mountingDivId} #${svgId}`)) return
      const appended = !!appendSvg(mountingDivId, svgId);
      setAppendedSvg(appended)
    }, []);
    const { canvasHeight, canvasWidth } = getCanvasDimensions()
    
    const [selectedSphere] = useAtom(currentSphere);
    const sphereHierarchyBounds : SphereHierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
    const { depthIndex, 
            setDepthIndex, 
            breadthIndex, 
            setBreadthIndex, 
            incrementBreadth, 
            decrementBreadth, 
            incrementDepth, 
            decrementDepth,
            maxBreadth,
            maxDepth
          } = useNodeTraversal(sphereHierarchyBounds[selectedSphere!.entryHash as keyof SphereHierarchyBounds] as HierarchyBounds, selectedSphere.entryHash as EntryHashB64);

    return (
      <>
        <Component
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          margin={defaultMargins}
          selectedSphere={selectedSphere}
          breadthIndex={breadthIndex}
          depthIndex={depthIndex}
          render={(currentVis: any, queryType: VisCoverage) => {
            // Determine need for traversal controld
            const withTraversal = queryType == VisCoverage.Partial;

            // Trigger the Vis object render function only once the SVG is appended to the DOM
            appendedSvg && currentVis?.render();
            const onlyChild = currentVis.rootData?.data?.children && currentVis.rootData.data?.children.length ==1;
            console.log('currentVis.rootData :>> ', currentVis.rootData);
// console.log('withTraversal, depthIndex, breadthIndex :>> ', queryType, withTraversal, depthIndex, breadthIndex, maxBreadth, maxDepth);
            return (
              <> 
                {!!(withTraversal && depthIndex !== 0) && <UpOutlined data-testid={"traversal-button-up"} className='fixed text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "46vw", top: "14vh"}}  onClick={decrementDepth} />}
                {!!(withTraversal && breadthIndex !== 0) && <LeftOutlined data-testid={"traversal-button-left"} className='fixed left-1 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "29vh"}} onClick={decrementBreadth} />}
                
                {!!(withTraversal && maxBreadth && breadthIndex < maxBreadth) && <RightOutlined data-testid={"traversal-button-right"} className='fixed right-1 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "29vh"}}  onClick={incrementBreadth} />}
                {!!(withTraversal && maxDepth && depthIndex < maxDepth && onlyChild) && <DownOutlined data-testid={"traversal-button-down"} className='fixed text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "46vw", bottom: "43vh"}}  onClick={incrementDepth} />}
                {!!(withTraversal && maxDepth && depthIndex < maxDepth && !onlyChild) && <DownOutlined data-testid={"traversal-button-down-left"} className='fixed text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{left: "12vw", bottom: "45vh", transform: "rotate(45deg)"}}  onClick={incrementDepth} />}
                {/* {!!(withTraversal && maxDepth && depthIndex < maxDepth && !onlyChild) && <DownOutlined data-testid={"traversal-button-down-right"} className='fixed text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "12vw", bottom: "45vh", transform: "rotate(-45deg)"}}  onClick={() => {console.log('maxBreadth, setBreadthIndex :>> ', currentVis.rootData.data.children.length-1, setBreadthIndex); incrementDepth(); setBreadthIndex(currentVis.rootData.data.children.length-1);}} />} */}
              </>
            )
          }}
        ></Component>
      </>
    );
  }
  //@ts-ignore
  return <ComponentWithVis  />
}
