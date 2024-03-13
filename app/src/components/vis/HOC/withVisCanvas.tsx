import React, { ComponentType, ReactNode, useEffect, useState } from 'react'

import "./vis.css";

import { Margins, VisProps, VisCoverage } from '../types';
import { select } from "d3-selection";
import { useAtom, useAtomValue } from 'jotai';
import { useNodeTraversal } from '../../../hooks/useNodeTraversal';
import { HierarchyBounds, SphereHierarchyBounds, currentOrbitCoords, currentOrbitId as currentOrbitIdAtom, currentSphere, currentSphereHierarchyBounds } from '../../../state/currentSphereHierarchyAtom';
import { DownOutlined, EnterOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons';
import { WithVisCanvasProps } from '../types';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { Modal } from 'flowbite-react';
import { CreateOrbit } from '../../forms';
import { nodeCache, store } from '../../../state/jotaiKeyValueStore';

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
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentParentOrbitEh, setCurrentParentOrbitEh] = useState<EntryHashB64>();
    
    
    const selectedSphere = store.get(currentSphere);
    // const {x, y} = store.get(currentOrbitCoords);
    const sphereHierarchyBounds : SphereHierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
    const { incrementBreadth, 
            decrementBreadth, 
            incrementDepth, 
            decrementDepth,
            maxBreadth,
            maxDepth
          } = useNodeTraversal(sphereHierarchyBounds[selectedSphere!.entryHash as keyof SphereHierarchyBounds] as HierarchyBounds);

    return (
      <>
        <Component
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          margin={defaultMargins}
          selectedSphere={selectedSphere}
          render={(currentVis: any, queryType: VisCoverage,x,y, newRootData) => {
            // Determine need for traversal controls
            const withTraversal: boolean = queryType == VisCoverage.Partial;
            let onlyChildParent: boolean;
            let hasChild: boolean = newRootData?.data?.children && newRootData?.data?.children.length > 0;
            let hasOneChild: boolean = newRootData?.data?.children && newRootData?.data?.children.length == 1;


            if(appendedSvg) {
              // Pass through setState handlers for the modal opening and current append/prepend Node parent entry hash
              currentVis.modalOpen = setIsModalOpen;
              currentVis.modalParentOrbitEh = setCurrentParentOrbitEh;
              if(currentVis && currentVis.rootData && coordsChanged(currentVis?.rootData?._translationCoords)) {
                const currentOrbit = newRootData?.find(d => {
                  if(!d) return false
                  const siblings = d?.parent && d.parent.children.map(d => d.data.content)
                  // console.log('d, siblings :>> ', d, siblings);
                  return siblings && siblings.length > 0 && d.parent?.children[x] ? (d.parent?.children[x].data.content == d.data.content) && d.depth == y
                    : false
                });
                if(currentOrbit?.data?.content) {
                  const node = currentVis.nodeDetails[selectedSphere.actionHash as ActionHashB64];
                  // currentOrbit && store.set(currentOrbitIdAtom, currentOrbit.data.content);
                }
                hasChild = newRootData?.data.children && newRootData?.data.children.length > 0  
              }
  
              onlyChildParent = currentVis.rootData.parent == null || currentVis.rootData.parent?.children && currentVis.rootData.parent?.children.length == 1;
              // Trigger the Vis object render function only once the SVG is appended to the DOM
              currentVis?.render();

            }
            
            function coordsChanged(translationCoords) : boolean {
              if(typeof translationCoords == 'undefined') return false
              return translationCoords[0] !== x || translationCoords[1] !== y
            }
            // console.log('UP :>> ', y !== 0);
            // console.log('LEFT :>> ', x !== 0);
            // console.log('DOWN :>> ', hasChild && hasOneChild);
            // console.log('DOWNLEFT :>> ', hasChild && !hasOneChild);
            // console.log('RIGHT :>> ', !!(withTraversal && maxBreadth && x < maxBreadth));
            // console.log('x,y,maxBreadth :>> ', x,y,maxBreadth);

            return (
              <> 
                {!!(withTraversal && y !== 0) && <EnterOutlined data-testid={"traversal-button-up"} className='fixed text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{left: "3px", top: "23vh", transform: "scaley(-1)"}}  onClick={decrementDepth} />}
                {!!(withTraversal && x !== 0) && <LeftOutlined data-testid={"traversal-button-left"} className='fixed left-1 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "29vh"}} onClick={decrementBreadth} />}
                {!!(withTraversal && hasChild && !hasOneChild) && <EnterOutlined data-testid={"traversal-button-down-left"} className='fixed text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{left: "3px", top: "35vh", transform: "rotate(90deg), scalex(-1)"}}  onClick={incrementDepth} />}
                
                {!!(withTraversal && maxBreadth && x < maxBreadth) && <RightOutlined data-testid={"traversal-button-right"} className='fixed right-1 text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{top: "29vh"}}  onClick={incrementBreadth} />}
                {!!(withTraversal && hasChild && hasOneChild) && <RightOutlined data-testid={"traversal-button-down"} className='fixed text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "43vw", bottom: "43vh", transform: "rotate(90deg)"}}  onClick={incrementDepth} />}
              {/* {!!(withTraversal && maxDepth && y < maxDepth && !onlyChildParent) && <DownOutlined data-testid={"traversal-button-down-right"} className='fixed text-3xl text-off-white hover:text-primary hover:cursor-pointer' style={{right: "12vw", bottom: "45vh", transform: "rotate(-45deg)"}}  onClick={() => {console.log('maxBreadth, setBreadthIndex :>> ', currentVis.rootData.data.children.length-1, setBreadthIndex); incrementDepth(); setBreadthIndex(currentVis.rootData.data.children.length-1);}} />} */}

                <Modal show={isModalOpen} onClose={() => {setIsModalOpen(false)}}>
                  <Modal.Header>
                    Create Orbit
                  </Modal.Header>
                  <Modal.Body>
                    <CreateOrbit editMode={false} inModal={true} sphereEh={selectedSphere!.entryHash as EntryHashB64} parentOrbitEh={currentParentOrbitEh} onCreateSuccess={() => {
                      setIsModalOpen(false);
                      currentVis.isModalOpen = false; // TODO, let this happen on cancel by adding onCancel callback
                      currentVis.nodeDetails = store.get(nodeCache.items)![selectedSphere.actionHash as ActionHashB64]
                      currentVis.setNodeAndLinkGroups.call(currentVis);
                      currentVis.setNodeAndLinkEnterSelections.call(currentVis);
                      currentVis.setCircleAndLabelGroups.call(currentVis);
                      currentVis.appendCirclesAndLabels.call(currentVis);
                      currentVis.appendNodeDetailsAndControls.call(currentVis);
                      currentVis.appendLinkPath.call(currentVis);
                      currentVis.skipMainRender = true;
                    }}></CreateOrbit>
                  </Modal.Body>
                </Modal>
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
