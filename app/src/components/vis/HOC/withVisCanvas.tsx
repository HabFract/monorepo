import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "./vis.css";

import { Margins } from '../types';
import { select } from 'd3';
import { useAtom, useAtomValue } from 'jotai';
import { HierarchyBounds, SphereHashes, currentSphere, currentSphereHierarchyBounds } from '../../../state/currentSphereHierarchyAtom';
import { DownCircleFilled, DownOutlined, LeftOutlined, RightOutlined, UpCircleFilled, UpOutlined } from '@ant-design/icons';

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

const appendSvg = (mountingDivId: string, divId: string) : void => {
  select(`#${divId}`).empty() &&
    select(`#${mountingDivId}`)
      .append("svg")
      .attr("id", `${divId}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("style", "pointer-events: all");
};

export type VisComponent = { // e.g. OrbitTree, OrbitCluster
  canvasHeight: number;
  canvasWidth: number;
  margin: Margins;
  selectedSphere: SphereHashes;
  breadthIndex: number;
  depthIndex: number;
  render: (currentVis: any, queryType: string) => JSX.Element;
}

export function withVisCanvas(Component: ComponentType<VisComponent>): ReactNode {
  const ComponentWithVis: React.FC<any> = (hocProps: VisComponent) => {
    const { canvasHeight, canvasWidth } = d3SetupCanvas()
    const mountingDivId = 'vis-root';
    const svgId = 'vis';
    
    const [depthIndex, setDepthIndex] = useState<number>(0);
    const [breadthIndex, setBreadthIndex] = useState<number>(0);
    const [selectedSphere] = useAtom(currentSphere);

    useEffect(() => {
      if(document.querySelector(`#${mountingDivId} #${svgId}`)) return
      appendSvg(mountingDivId, svgId);
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
            currentVis?.render();
            return (
              <> 
                {withTraversal && depthIndex !== 0 && <UpOutlined className='fixed top-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "48vw"}}  onClick={decrementDepth} />}
                {withTraversal && breadthIndex !== 0 && <LeftOutlined className='fixed left-2 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "48vh"}} onClick={decrementBreadth} />}
                <div id="vis-root" className="h-full"></div>
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
