import React, { ComponentType, ReactNode, useEffect} from 'react'

import "./vis.css";

import {zoomIdentity} from 'd3';
import { Margins } from '../types';

const margin : Margins = {
  top: (document.body.getBoundingClientRect().height / (document.body.getBoundingClientRect().height > 1025 ? 6 : 4)),
  right: 0,
  bottom: 0,
  left: 200,
};

const VIS_SVG_IDS = {
  "tree" : 0,
  "cluster" : 1,
  "radial" : 2,
}

const d3SetupCanvas = function () {
  const { height,width } = document.body.getBoundingClientRect();
  const canvasHeight = height - margin.top - margin.bottom;
  const canvasWidth = width - margin.right - margin.left;

  return { canvasHeight, canvasWidth };
};

// const unBindTouchHandlers = (visObj:any) => {
//               if (!visObj?._manager) return
//               visObj._manager.off('singletap')
//               visObj._manager.off('doubletap')

//               !!visObj._manager?.element && visObj._manager.destroy()
//             }

export function withVis<T> (C : ComponentType<T>) : ReactNode {
  const WithVisC: React.FC = (hocProps: T) => {
    const { changesMade } = hocProps;
    // let deleteCompleted = useAppSelector(selectDeleteCompleted)

    // const dispatch = useAppDispatch();
    const { canvasHeight, canvasWidth } = d3SetupCanvas()
    
    // const currentPath = useLocation()
    // const lastPath = useLastLocation()
    // const routeChanged = !!lastPath && (currentPath.pathname !== lastPath?.pathname);

    return (
      <C canvasHeight={canvasHeight} canvasWidth={canvasWidth} margin={margin} divId={VIS_SVG_IDS['']||'9'} changesMade={changesMade} render={(currentVis:any) => {

        useEffect(() => {
          if (!currentVis?._manager) return  // If mobile event handlers have already been bound

          // Propagate changes to the App component so that it can post new habitDates only after a doubletap event is handled
            const f = currentVis.eventHandlers.rgtClickOrDoubleTap.bind(null)
            currentVis.eventHandlers.rgtClickOrDoubleTap = function (e:any, d:any) {
              f.call(null, e, d) // Call the original function
              changesMade(true)
            }.bind(currentVis)

            // Unbind other vis hammerjs mobile event handlers
            // const otherVisObjs = selectOtherVisObjects(currentVis.type, store.getState());
            // otherVisObjs.forEach(unBindTouchHandlers);
          
            // Rebind current mob events if they were lost due to the above
            currentVis?._manager.handlers.length === 0 && currentVis.bindMobileEventHandlers(currentVis._enteringNodes)
        }, [])
  
        // useEffect(() => {
        //   if (deleteCompleted) {
        //     currentVis.render()
        //     dispatch(resetDeleteCompleted())
        //   }
        // }, [deleteCompleted])
        
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
          <>
          <button
                type="button"
                id="collapse-tree"
                className="vis-button"
                onClick={(e) => {
                  const {target} = e
                  target.classList.toggle('active');
                  try {
                  target.textContent == "Collapse"
                    ? currentVis.collapse()
                    : currentVis.expand();
                  target.textContent = target.textContent.includes("Collapse")
                    ? "Expand"
                    : "Collapse"; 
                  } catch (error) {
                    console.error("Could not mutate tree: ", error);
                  }
                }}
          >
            <span>{currentVis?.rootData && (currentVis.rootData._children ? "Expand" : "Collapse")}</span>
          </button>
          <button
                type="button"
                id="reset-tree"
                className="vis-button"
                onClick={(_e) => {
                  window.scrollTo(0,0)
                  try {
                    currentVis?.resetForExpandedMenu && currentVis.resetForExpandedMenu({justTranslation: false})
                  } catch (error) {
                    console.error("Could not mutate tree: ", error);
                  }
                }}
          >
            <span>RESET VIEW</span>
          </button>
      </>
      )}} />)
  }
  return <WithVisC />
}
