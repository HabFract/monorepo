import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "./vis.css";

import { Margins, VisComponent } from '../types';
import { select } from 'd3';
import { useAtom, useAtomValue } from 'jotai';
import { useNodeTraversal } from '../../../hooks/useNodeTraversal';
import { HierarchyBounds, SphereHierarchyBounds, currentSphere, currentSphereHierarchyBounds } from '../../../state/currentSphereHierarchyAtom';
import { DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons';
import { VisParams } from '../types';
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
      .attr("height", "100%")
      .attr("style", "pointer-events: all");
};

export function withVisCanvas(Component: ComponentType<VisComponent>): ReactNode {
  const ComponentWithVis: React.FC<VisParams> = (_visParams: VisParams) => {
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
          render={(currentVis: any, queryType: string) => {
            const withTraversal = queryType !== 'whole';
            appendedSvg && currentVis?.render();

            return (
              <> 
                {withTraversal && depthIndex !== 0 && <UpOutlined className='fixed top-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "48vw"}}  onClick={decrementDepth} />}
                {withTraversal && breadthIndex !== 0 && <LeftOutlined className='fixed left-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "48vh"}} onClick={decrementBreadth} />}
                
                {withTraversal && maxBreadth && breadthIndex < maxBreadth && <RightOutlined className='fixed right-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "48vh"}}  onClick={incrementBreadth} />}
                {withTraversal && maxDepth && depthIndex < maxDepth && <DownOutlined className='fixed bottom-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "48vw"}}  onClick={incrementDepth} />}
              </>
            )
          }}
        ></Component>
      </>
    );
  }
  return <ComponentWithVis  />
}
