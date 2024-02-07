import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "./vis.css";

import { Margins, VisComponent } from '../types';
import { select } from 'd3';
import { useAtom, useAtomValue } from 'jotai';
import { HierarchyBounds, SphereHashes, currentSphere, currentSphereHierarchyBounds } from '../../../state/currentSphereHierarchyAtom';
import { DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons';
import { VisParams } from '../types';

const defaultMargins: Margins = {
  top: (document.body.getBoundingClientRect().height / (document.body.getBoundingClientRect().height > 1025 ? 6 : 2)),
  right: 0,
  bottom: 0,
  left: 0,
};

const d3SetupCanvas = function () {
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
    const { canvasHeight, canvasWidth } = d3SetupCanvas()
    
    const [depthIndex, setDepthIndex] = useState<number>(0);
    const [breadthIndex, setBreadthIndex] = useState<number>(0);
    const [appendedSvg, setAppendedSvg] = useState<boolean>(false);
    const [selectedSphere] = useAtom(currentSphere);

    useEffect(() => {
      if(document.querySelector(`#${mountingDivId} #${svgId}`)) return
      const appended = !!appendSvg(mountingDivId, svgId);
      setAppendedSvg(appended)
      console.log('appended :>> ', appended);
    }, []);

    const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
    const incrementBreadth = () => {
      if(hierarchyBounds && hierarchyBounds[selectedSphere.entryHash as keyof HierarchyBounds]) {
        const newIndex = (breadthIndex + 1) <= hierarchyBounds[selectedSphere.entryHash as keyof HierarchyBounds]?.maxBreadth ? breadthIndex + 1 : breadthIndex;
        setBreadthIndex(newIndex)
      }
    }
    const decrementBreadth = () => {
      setBreadthIndex(Math.max.apply(null, [0, breadthIndex - 1]))
    }
    const incrementDepth = () => {
      if(hierarchyBounds && hierarchyBounds[selectedSphere.entryHash as keyof HierarchyBounds]) {
        const newIndex = (depthIndex + 1) <= hierarchyBounds[selectedSphere.entryHash as keyof HierarchyBounds]?.maxDepth ? depthIndex + 1 : depthIndex;
        setDepthIndex(newIndex)
      }
    }
    const decrementDepth = () => {
      setDepthIndex(Math.max.apply(null, [0, depthIndex - 1]))
    }
    
    const maxBreadth = hierarchyBounds[selectedSphere.entryHash as keyof HierarchyBounds]?.maxBreadth;
    const maxDepth = hierarchyBounds[selectedSphere.entryHash as keyof HierarchyBounds]?.maxDepth;
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
  return <ComponentWithVis />
}
