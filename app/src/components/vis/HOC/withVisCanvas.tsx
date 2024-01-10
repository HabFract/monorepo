import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "./vis.css";

import { Margins } from '../types';
import { select } from 'd3';
import { useAtom } from 'jotai';
import { SphereHashes, currentSphere } from '../../../state/currentSphere';
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

    const incrementBreadth = () => {
      setBreadthIndex(1)
    }
    const decrementBreadth = () => {
      setBreadthIndex(0)
      console.log('breadthIndex :>> ', breadthIndex);
    }
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
            return (
              <><div id="vis-root" className="h-full"></div></>
            )
          }}
        ></Component>
        <LeftOutlined className='fixed left-2 text-3xl text-white' style={{top: "48vh"}} onClick={decrementBreadth} />
        <RightOutlined className='fixed right-2 text-3xl text-white' style={{top: "48vh"}}  onClick={incrementBreadth} />
      </>
    );
  }
  return <ComponentWithVis />
}
