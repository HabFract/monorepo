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

export function withVis<T>(Component: ComponentType<T>): ReactNode {
  const ComponentWithVis: React.FC<any> = (_hocProps: T) => {
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
            // if (!currentVis?._manager) return  // If mobile event handlers have already been bound

            // Propagate changes to the App component so that it can post new habitDates only after a doubletap event is handled
            // const f = currentVis.eventHandlers.rgtClickOrDoubleTap.bind(null)
            // currentVis.eventHandlers.rgtClickOrDoubleTap = function (e: any, d: any) {
            //   f.call(null, e, d) // Call the original function
            //   changesMade(true)
            // }.bind(currentVis)

            // Unbind other vis hammerjs mobile event handlers
            // const otherVisObjs = selectOtherVisObjects(currentVis.type, store.getState());
            // otherVisObjs.forEach(unBindTouchHandlers);

            // Rebind current mob events if they were lost due to the above
            // currentVis?._manager.handlers.length === 0 && currentVis.bindMobileEventHandlers(currentVis._enteringNodes)
          }, [])

          useEffect(() => {
            // if (deleteCompleted) {
            appendSvg(mountingDivId, svgId);

            currentVis?.render()
            // dispatch(resetDeleteCompleted())
            // }
          }, [currentVis])//deleteCompleted])

          // if (routeChanged) {
          //   if (currentVis?.rootData) {
          //     currentVis.zoomBase().call(
          //       currentVis.zoomer.transform,
          //       zoomIdentity
          //     )
          //     currentVis.rootData.routeChanged = true
          //   }
          //   return (<Redirect to={currentPath.pathname} />)
          // }

          return (
            <><div id="vis-root" className="h-full"></div></>
          )
        }}></Component>)
  }
  return <ComponentWithVis />
}
