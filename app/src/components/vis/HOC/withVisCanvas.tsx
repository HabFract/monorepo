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
  top: (document.body.getBoundingClientRect().height / (document.body.getBoundingClientRect().height > 1025 ? 6 : 2)),
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
console.log('withTraversal, depthIndex, breadthIndex :>> ', queryType, withTraversal, depthIndex, breadthIndex, maxBreadth, maxDepth);
            return (
              <> 
                {!!(withTraversal && depthIndex !== 0) && <UpOutlined className='fixed top-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "48vw"}}  onClick={decrementDepth} />}
                {!!(withTraversal && breadthIndex !== 0) && <LeftOutlined className='fixed left-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "48vh"}} onClick={decrementBreadth} />}
                
                {!!(withTraversal && maxBreadth && breadthIndex < maxBreadth) && <RightOutlined className='fixed right-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "48vh"}}  onClick={incrementBreadth} />}
                {!!(withTraversal && maxDepth && depthIndex < maxDepth) && <DownOutlined className='fixed bottom-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "48vw"}}  onClick={incrementDepth} />}
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
