import React, { ComponentType, ReactNode, useEffect } from 'react'

import "./vis.css";

import { Margins } from '../types';
import { select } from 'd3';

const defaultMargins: Margins = {
  top: (document.body.getBoundingClientRect().height / (document.body.getBoundingClientRect().height > 1025 ? 6 : 4)),
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
  render: (currentVis: any) => JSX.Element;
}

export function withVisCanvas(Component: ComponentType<VisComponent>): ReactNode {
  const ComponentWithVis: React.FC<any> = (_hocProps: VisComponent) => {
    const { canvasHeight, canvasWidth } = d3SetupCanvas()
    const mountingDivId = 'vis-root';
    const svgId = 'vis';

    return (
      <Component
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        margin={defaultMargins}
        render={(currentVis: any) => {


          useEffect(() => {
            // if (deleteCompleted) {
            appendSvg(mountingDivId, svgId);

            currentVis?.render()
            // dispatch(resetDeleteCompleted())
            // }
          }, [currentVis])//deleteCompleted])

          return (
            <><div id="vis-root" className="h-full"></div></>
          )
        }}></Component>)
  }
  return <ComponentWithVis />
}
