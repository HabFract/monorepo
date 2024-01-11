import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "./vis.css";

import { Margins } from '../types';
import { select } from 'd3';
import { useAtom, useAtomValue } from 'jotai';
import { HierarchyBounds, SphereHashes, currentSphere, currentSphereHierarchyBounds } from '../../../state/currentSphereHierarchy';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

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
  render: (currentVis: any) => JSX.Element;
}

export function withVisCanvas(Component: ComponentType<VisComponent>): ReactNode {
  const ComponentWithVis: React.FC<any> = (hocProps: VisComponent) => {
    const { canvasHeight, canvasWidth } = d3SetupCanvas()
    const mountingDivId = 'vis-root';
    const svgId = 'vis';
    
    const [breadthIndex, setBreadthIndex] = useState<number>(0);
    const [selectedSphere] = useAtom(currentSphere);

    useEffect(() => {
      if(document.querySelector(`#${mountingDivId} #${svgId}`)) return
      appendSvg(mountingDivId, svgId);
    }, []);

    return (
      <>
        <Component
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          margin={defaultMargins}
          selectedSphere={selectedSphere}
          breadthIndex={breadthIndex}
          render={(currentVis: any) => {
            currentVis?.render();
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
            
            console.log('breadthIndex :>> ', breadthIndex);
            const maxBreadth = hierarchyBounds[selectedSphere.entryHash as keyof HierarchyBounds]?.maxBreadth;
            return (
              <>
                {breadthIndex !== 0 && <LeftOutlined className='fixed left-2 text-3xl text-white' style={{top: "48vh"}} onClick={decrementBreadth} />}
                <div id="vis-root" className="h-full"></div>
                {maxBreadth && breadthIndex < maxBreadth && <RightOutlined className='fixed right-2 text-3xl text-white' style={{top: "48vh"}}  onClick={incrementBreadth} />}
              </>
            )
          }}
        ></Component>
      </>
    );
  }
  return <ComponentWithVis />
}
