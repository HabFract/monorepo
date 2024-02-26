import { select } from "d3-selection";
import { scaleOrdinal, scaleLinear } from "d3-scale";
import { zoom } from "d3-zoom";
import { linkVertical, linkHorizontal } from "d3-shape";
import { tree, hierarchy } from "d3-hierarchy";
import { easeCubic, easePolyIn, easeLinear } from "d3-ease";
import { TreeLayout } from "d3-hierarchy";
import { legendColor } from "d3-svg-legend";

import Hammer from "hammerjs";
import propagating from "propagating-hammerjs";
import _ from "lodash";

// import { selectCurrentNodeByMptt } from "features/node/selectors";
// import {
//   selectCurrentHabit,
//   selectCurrentHabitByMptt,
//   selectStoredHabits,
// } from "features/habit/selectors";
// import { fetchHabitDatesREST } from "features/habitDate/actions";
// import { selectCurrentHabitDate } from "features/habitDate/selectors";
// import UISlice from "features/ui/reducer";
// const { toggleConfirm } = UISlice.actions;
// import HabitSlice from "features/habit/reducer";
// const { updateCurrentHabit } = HabitSlice.actions;
// import NodeSlice from "features/node/reducer";
// const { updateCurrentNode } = NodeSlice.actions;
// import HabitDateSlice from "features/habitDate/reducer";
// const { createHabitDate, updateHabitDateForNode } = HabitDateSlice.actions;
// import hierarchySlice from "features/hierarchy/reducer";
// import { selectCurrentDateId, selectCurrentDate } from "../space/slice";
import { ONE_CHILD, TWO_CHILDREN_LEFT, TWO_CHILDREN_RIGHT, THREE_CHILDREN } from './PathTemplates/test';

import {
  expand,
  collapse,
  nodeWithoutHabitDate,
  contentEqual,
  nodeStatusColours,
  parseTreeValues,
  cumulativeValue,
  outOfBoundsNode,
  oppositeStatus,
  getColor,
  isALeaf,
  hierarchyStateHasChanged,
  getInitialXTranslate,
  getInitialYTranslate,
  newXTranslate,
  newYTranslate,
  debounce,
} from "./helpers";
// import { debounce, console.error, isTouchDevice } from "app/helpers";

import {
  positiveCol,
  negativeCol,
  noNodeCol,
  neutralCol,
  parentPositiveBorderCol,
  positiveColLighter,
  BASE_SCALE,
  FOCUS_MODE_SCALE,
  LG_BUTTON_SCALE,
  LG_LABEL_SCALE,
  LG_LEVELS_HIGH,
  LG_LEVELS_WIDE,
  LG_NODE_RADIUS,
  XS_BUTTON_SCALE,
  XS_LABEL_SCALE,
  XS_LEVELS_HIGH,
  XS_LEVELS_WIDE,
  XS_NODE_RADIUS,
} from "./constants";
import { EventHandlers, IVisualization, Margins, ViewConfig, VisType, ZoomConfig } from "./types";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { Scale } from "../../graphql/generated";

export interface OrbitNodeDetails {
  id: ActionHashB64
  eH?: EntryHashB64;
  description?: string;
  name: string
  scale: Scale
  startTime: number
  endTime: number;
  checked: boolean;
}

export type SphereOrbitNodes = {
  [key: EntryHashB64]: OrbitNodeDetails
}

export type SphereNodeDetailsCache = {
  [key: EntryHashB64]: SphereOrbitNodes
}

export default class BaseVisualization implements IVisualization {
  type: VisType;
  _svgId: string;
  _canvas: any;
  _manager: any;
  zoomer: any;
  rootData: any;
  nodeDetails: SphereOrbitNodes;
  sphereHash: ActionHashB64;
  globalStateTransition: Function;
  modalOpen?: Function;
  modalParentOrbitEh?: Function;
  _nextRootData: any;
  layout!: TreeLayout<unknown>;
  _viewConfig: ViewConfig;
  _zoomConfig: ZoomConfig;
  eventHandlers: EventHandlers;
  _hasRendered: boolean = false;
  isNewActiveNode?: boolean;
  activeNode: any;
  _enteringNodes: any;
  isCollapsed: boolean = false;
  isExpanded: boolean = false;
  expand: () => void;
  collapse: () => void;
  currentEventTimestamp!: number;

  _gLink: any;
  _gNode: any;
  _gCircle: any;
  gCirclePulse: any;
  _gTooltip: any;
  _gButton: any;
  _enteringLinks: any;

  constructor(type, svgId, inputTree, canvasHeight, canvasWidth, margin: Margins, nodeDetails: SphereOrbitNodes, globalStateTransition, sphereHash: ActionHashB64) {
    this.type = type;
    this._svgId = svgId;
    this.rootData = inputTree;
    this.nodeDetails = nodeDetails;
    this.sphereHash = sphereHash;
    this.globalStateTransition = globalStateTransition;
    
    this._viewConfig = {
      scale: type == VisType.Radial ? BASE_SCALE / 2 : BASE_SCALE,
      clickScale: FOCUS_MODE_SCALE,
      margin: margin,
      canvasHeight,
      canvasWidth,
      defaultView: 'Tree',

      defaultCanvasTranslateX: () => {
        const initialX = getInitialXTranslate.call(this, 
          { defaultView: this._viewConfig.defaultView, levelsWide: this._viewConfig.levelsWide });
        return typeof this._zoomConfig.previousRenderZoom?.node?.x !==
          "undefined"
          ? initialX + this._viewConfig.margin.left +
              (newXTranslate(this.type, this._viewConfig, this._zoomConfig) as number)
          : initialX + this._viewConfig.margin.left;
      },
      defaultCanvasTranslateY: () => {
        const initialY = getInitialYTranslate.call(
          this,
          this.type,
          { defaultView: this._viewConfig.defaultView, levelsHigh: this._viewConfig.levelsHigh },
        );
        return typeof this._zoomConfig.previousRenderZoom?.node?.y !==
          "undefined"
          ? (this._viewConfig.margin.top as number) +
              initialY +
              newYTranslate(
                this.type,
                this._viewConfig,
                this._zoomConfig
              ) as number
          : initialY + this._viewConfig.margin.top;
      },
      isSmallScreen: function () {
        return this.canvasWidth < 1025;
      },
    };

    this._zoomConfig = {
      focusMode: false,
      previousRenderZoom: {},
      zoomedInView: function () {
        return Object.keys(this.previousRenderZoom).length !== 0;
      },
    };

    this.eventHandlers = {
      handlePrependNode: function () {
        this.modalOpen(true);
      },
      handleAppendNode: function ({parentOrbitEh}) {
        this.modalOpen(true);
        this.modalParentOrbitEh(parentOrbitEh)
      },
      handleDeleteNode: function (_, node) {
        // this.setCurrentHabit(node);
        // this.setCurrentNode(node);
        // store.dispatch(toggleConfirm({ type: "Delete" }));
        // this.render();
      },
      rgtClickOrDoubleTap: function (e, d) {
        // this.eventHandlers.handleNodeFocus.call(this, e, d);
        // this.handleStatusChange.call(this, d);
        // this.type != "radial" &&
        //   this.eventHandlers.handleNodeZoom.call(this, e, d, false);
      }.bind(this),
      handleNodeZoom: function (event, node, forParent = false) {
        // if (!node) return;
        // this._zoomConfig.globalZoomScale = this._viewConfig.clickScale;
        // this._zoomConfig.focusMode = true;

        // if (event) {
        //   this.setActiveNode(node.data, event);
        // }
        // const parentNode = { ...node.parent };

        // if (!this._gLink.attr("transform")) {
        //   // Set for cross render transformation memory
        //   this._zoomConfig.previousRenderZoom = {
        //     event: event,
        //     node: forParent ? parentNode : node,
        //     scale: this._zoomConfig.globalZoomScale,
        //   };
        // }
        // select(".canvas")
        //   .transition()
        //   .ease(easePolyIn.exponent(8))
        //   .delay(!!event || !this.isNewActiveNode ? 0 : 100)
        //   .duration(!!event || !this.isNewActiveNode ? 1 : 2000)
        //   .attr(
        //     "transform",
        //     `translate(${this._viewConfig.defaultCanvasTranslateX(
        //       this._zoomConfig.globalZoomScale
        //     )},${this._viewConfig.defaultCanvasTranslateY(
        //       this._zoomConfig.globalZoomScale
        //     )}), scale(${this._zoomConfig.globalZoomScale})`
        //   );
      },
      handleNodeFocus: function (event, node) {
        // event.preventDefault();
        // this.calibrateViewBox();
        // const currentHabit = selectCurrentHabit(store.getState());

        // const targ = event?.target;
        // if (targ.tagName == "circle") {
        //   if (
        //     !!node?.data?.name &&
        //     !(node.data.name == currentHabit?.meta.name)
        //   ) {
        //     this.setCurrentHabit(node);
        //     this.setCurrentNode(node);
        //   }
        //   if (currentHabit?.meta?.name !== node?.data?.name)
        //     this.setActiveNode(node.data, event);

        //   // if (this.type == VisType.Tree) {
        //   //   const nodesToCollapse = nodesForCollapse
        //   //     .call(this, node, {
        //   //       cousinCollapse: true,
        //   //       auntCollapse: true,
        //   //     })
        //   //     .map((n) => n?.data?.content);
        //   //   this.rootData.each((node) => {
        //   //     if (nodesToCollapse.includes(node.data.content)) collapse(node);
        //   //   });
        //   //   expand(node?.parent ? node.parent : node);
        //   //   this.render();
        //   // }
        // }
      },
      handleMouseEnter: function ({ target: d }) {
        this.currentTooltip = select(d).selectAll("g.tooltip");
        
        this.currentTooltip.transition().duration(450).style("opacity", "1");
        this.currentButton = select(d).selectAll("g.habit-label-dash-button");
        this.currentButton
          .transition()
          .delay(100)
          .duration(450)
          .style("opacity", "1");
      },
      handleMouseLeave: function (e) {
        // const g = select(e.target);
        // g.select(".tooltip").transition().duration(50).style("opacity", "0");
        // g.select(".habit-label-dash-button")
        //   .transition()
        //   .delay(2000)
        //   .duration(150)
        //   .style("opacity", "0");
        // setTimeout(() => {
        //   this.currentButton = false;
        // }, 100);
        // setTimeout(() => {
        //   this.currentTooltip = false;
        // }, 100);
      },
      handleHover: function (e, d) {
        // // If it is an animated concentric circle, delegate to parent node
        // if (e.target.classList.length === 0) {
        //   d = e.target.parentElement.__data__;
        // }
        // if (parseTreeValues(d.data.content).status === "") return;
        // e.stopPropagation();
        // // Hide labels if they are not part of the current subtree
        // if (
        //   !(
        //     this.activeNode !== undefined &&
        //     d.ancestors().includes(this.activeNode)
        //   )
        // ) {
        //   return;
        // }
      },
    };

    this.expand = function () {
      const firstNode = this.rootData.find(
        (n) => !n?.data?.content.match(/OOB/)
      );
      expand(firstNode);
      this._nextRootData = this.rootData;
      this.isCollapsed = false;
      this.isExpanded = true;
      this.render();
    };
    this.collapse = function () {
      const firstNode = this.rootData.find(
        (n) => !n?.data?.content.match(/OOB/)
      );
      collapse(firstNode);
      this._nextRootData = this.rootData;
      this.isCollapsed = true;
      this.render();
    };
  }

  zoomBase() {
    return select(`#${this._svgId}`);
  }

  firstRender() : boolean {
    return !this._hasRendered;
  }

  clearFirstRenderFlag() {
    this._hasRendered = false;
  }

  noCanvas() : boolean {
    return (
      typeof this?._canvas == "undefined" ||
      (select(`#${this._svgId} .canvas`) as any)._groups.length == 0
    );
  }

  hasNextData() : boolean {
    return !!this?._nextRootData;
  }

  hasSummedData() : boolean {
    return !!this.rootData?.value;
  }

  hasNewHierarchyData() : boolean {
    return (
      this.hasNextData()// && hierarchyStateHasChanged(this._nextRootData, this)
    );
  }

  setActiveNode(clickedNodeContent, event : any = null) {
    this?.isNewActiveNode && delete this.isNewActiveNode;

    this.activeNode = this.findNodeByContent(clickedNodeContent);

    const currentActiveG = document.querySelector(".the-node.active");
    if (currentActiveG) currentActiveG.classList.toggle("active");
    event && event.target?.closest(".the-node")?.classList?.toggle("active");

    // this.render();
    // this.activateNodeAnimation();
    return this.activeNode;
  }

  findNodeByContent(node) {
    if (node === undefined || node.content === undefined) return;
    let found;
    this.rootData.each((n) => {
      if (contentEqual(n.data, node)) {
        found = n;
      }
    });
    return found;
  }

  setCurrentNode(node) : void {
    const nodeContent = node?.data
      ? parseTreeValues(node?.data.content)
      : parseTreeValues(node.content);
    // let newCurrent = selectCurrentNodeByMptt(
    //   store.getState(),
    //   nodeContent.left,
    //   nodeContent.right
    // );
    // if (!newCurrent) {
    //   console.error("Couldn't select node");
    //   return;
    // }
    // store.dispatch(updateCurrentNode(newCurrent));
  }

  setCurrentHabit(node) : void {
    let newCurrent;
    try {
      const nodeContent = node?.data
        ? parseTreeValues(node?.data.content)
        : parseTreeValues(node.content);
      // newCurrent = selectCurrentHabitByMptt(
      //   store.getState(),
      //   nodeContent.left,
      //   nodeContent.right
      // );
    } catch (err) {
      console.error("Couldn't select habit: " + err);
      return;
    }
    // store.dispatch(updateCurrentHabit(newCurrent));
    // const s = store.getState();
    // if (selectCurrentHabit(s)?.meta.id !== selectCurrentHabitDate(s)?.habitId) {
    //   store.dispatch(
    //     fetchHabitDatesREST({
    //       id: newCurrent?.meta.id,
    //       periodLength: 7,
    //     })
    //   );
    // }
  }

  updateRootDataAfterAccumulation(newRootData) {
    // const currentDate = selectCurrentDateId(store.getState());

    // const { updateCurrentHierarchy, updateCachedHierarchyForDate } =
    //   hierarchySlice.actions;
    // store.dispatch(
    //   updateCachedHierarchyForDate({
    //     dateId: currentDate,
    //     newHierarchy: newRootData,
    //   })
    // );
    // store.dispatch(updateCurrentHierarchy({ nextDateId: currentDate }));
    // this._nextRootData = newRootData;
    // delete this._nextRootData.newHabitDatesAdded;
  }

  addHabitDatesForNewNodes(
    startingNode = this.rootData,
    completedValue = false
  ) {
    // // If we are adding a false completed value (temp habit dates that will only be persisted if updated to true)
    // let newRootData = hierarchy({ ...this.rootData.data });
    // accumulateTree(newRootData, this);
    // if (startingNode.data.name == this.rootData.data.name) {
    //   // Option 1: Traverse the tree and create many
    //   newRootData.each((d) => {
    //     if (
    //       nodeWithoutHabitDate(d?.data, store) &&
    //       isALeaf(d) &&
    //       !d?.data.content.match(/OOB/)
    //     ) {
    //       this.createNewHabitDateForNode(d, completedValue);
    //       this.mutateTreeJsonForNewHabitDates(d);
    //     }
    //   });
    // } else {
    //   // Option 2: Create a new true habit date for a 'cascaded' ancestor node
    //   this.createNewHabitDateForNode(startingNode, JSON.parse(completedValue));
    // }
    // this.updateRootDataAfterAccumulation(newRootData);
    // this.rootData.newHabitDatesAdded = true;
  }

  mutateTreeJsonForNewHabitDates(d) {
    // Toggle in memory
    d.data.content = d.data.content.replace(/\-$/, "-false");
  }

  createNewHabitDateForNode(node, withStatus = false) {
    // const nodeContent = node?.data
    //   ? parseTreeValues(node?.data.content)
    //   : parseTreeValues(node.content);

    // const currentDate = selectCurrentDateId(store.getState());
    // const currentHabit = selectCurrentHabitByMptt(
    //   store.getState(),
    //   nodeContent.left,
    //   nodeContent.right
    // );
    // if (!currentHabit) {
    //   console.log("Couldn't select habit when adding habit dates");
    //   return;
    // }
    // // Create a habit date ready for persisting
    // store.dispatch(
    //   createHabitDate({
    //     habitId: currentHabit?.meta.id,
    //     dateId: currentDate,
    //     completed: withStatus,
    //   })
    // );
  }

  handleStatusChange(node) {
    // const nodeHasOOBAncestors =
    //   node.descendants().findIndex((n) => {
    //     return n.data.content.match(/OOB/);
    //   }) !== -1;

    // if (!isALeaf(node) && !nodeHasOOBAncestors) {
    //   return;
    // } else {
    //   const currentHabit = selectCurrentHabit(store.getState());
    //   const currentDate = selectCurrentDateId(store.getState());
    //   const currentDateFromDate = selectCurrentDate(store.getState())?.timeframe
    //     .fromDate;

    //   const nodeContent = parseTreeValues(node.data.content);
    //   const currentStatus = nodeContent!.status;

    //   const theNode = this.zoomBase()
    //     .selectAll(".the-node circle")
    //     .filter((n) => {
    //       if (!!n?.data?.name && n?.data?.name === node.data.name) return n;
    //     });
    //   if (node.data.name.includes("Sub-Habit")) return;
    //   // If this was not a ternarising/placeholder sub habit that we created just for more even distribution
    //   const newStatus = oppositeStatus(currentStatus);
    //   if (currentStatus == "true" && newStatus == "false") {
    //     this.addHabitDatesForNewNodes(node, false);
    //   } else {
    //     store.dispatch(
    //       updateHabitDateForNode({
    //         habitId: currentHabit?.meta?.id,
    //         dateId: currentDate,
    //         completed: JSON.parse(newStatus),
    //         fromDateForToday: currentDateFromDate,
    //       })
    //       // Also toggle 'cascaded' ancestor nodes
    //     );
    //   }
    //   if (currentStatus) {
    //     node.data.content = node.data.content.replace(/true|false/, newStatus);
    //   } else {
    //     node.data.content = node.data.content.replace(/\-$/, "-" + newStatus);
    //   }
    //   const newColor = getColor(JSON.parse(newStatus));
    //   theNode.attr("fill", newColor);
    //   theNode.attr("stroke", newColor);

    //   const storedHabits = selectStoredHabits(store.getState());
    //   let lastCascadedNode = false;
    //   node?.ancestors()?.length &&
    //     node.ancestors().forEach((a) => {
    //       if (a?.data?.name == currentHabit?.meta?.name || lastCascadedNode)
    //         return;
    //       if (a?.children && a.children.length > 1) {
    //         lastCascadedNode = true;
    //         return;
    //       }

    //       const nodeCircle = this.zoomBase()
    //         .selectAll(".the-node circle")
    //         .filter((n) => {
    //           if (!!n?.data?.name && n?.data?.name === a.data.name) return a;
    //         });

    //       nodeCircle.attr("fill", newColor);
    //       nodeCircle.attr("stroke", newColor);

    //       if (nodeWithoutHabitDate(a?.data, store)) {
    //         this.addHabitDatesForNewNodes(a, true);
    //         return;
    //       }

    //       if (parseTreeValues(a.data.content)?.status == "") {
    //         const habitId =
    //           storedHabits[
    //             storedHabits.findIndex((h) => h.meta?.name == a.data.name)
    //           ]?.meta?.id;

    //         store.dispatch(
    //           updateHabitDateForNode({
    //             habitId: habitId,
    //             dateId: currentDate,
    //             completed: JSON.parse(newStatus),
    //             fromDateForToday: currentDateFromDate,
    //           })
    //         );
    //       }
    //     });

    //   accumulateTree(this.rootData, this);
    //   this.updateRootDataAfterAccumulation(this.rootData);
    //   this.newHabitDatesAdded = true;
    // }
  }

  removeCanvas() : void {
    select(".canvas")?.remove();
  }

  clearCanvas(saveLinks: boolean) : void {
    select(".canvas").selectAll(saveLinks ? "*:not(g.links):not( path.link):not(g.links:last-of-type)" : "*").remove();
    select(".canvas").selectAll("g.links + g.links").remove();
  }

  translateLinks([dx, dy, breadth]: number[]) : void {
    const indexToBreadthRatio = (dx+1) / (breadth);
    const middleIndex = (breadth + 1) / 2;
    const isMiddleElement = (dx + 1) == middleIndex;
    const isChildElement = dy > 0; 
    
//     console.log('debug isMiddleElement, isChildElement, :>> ', isMiddleElement, isChildElement,);
//     console.log('debug dx dy ratio :>> ', dx, dy, indexToBreadthRatio);
//     const dxScaled = this._viewConfig!.dx as number / this._viewConfig.scale;
//     const fullWidth = (dxScaled * (this._viewConfig!.levelsWide as number)) * 2;
//     console.log('debug dxScaled, levelsWide, fullWidth, noderadius :>> ', dxScaled, this._viewConfig!.levelsWide, fullWidth, (this._viewConfig!.nodeRadius as number));
// //     + (this._viewConfig!.nodeRadius as number)  * 2 as any
// // + (this._viewConfig!.nodeRadius as number)  * 2 as any
//     const x = isMiddleElement ? 0 : indexToBreadthRatio > 0.5 ? (fullWidth) : -(fullWidth);
//     const y = -(this._viewConfig!.dy as number);
    const [path, dataTestId] = determinePathFragment(dx, dy, breadth);

    select(".canvas").selectAll("g.links *").remove();
    if(!!path) {
      select(".canvas").selectAll("g.links").append('path')
        .attr("d", path)
        .classed("link", true)
        .attr("stroke-width", "3")
        .attr("stroke-opacity", "0.3")
        .attr("data-testid", dataTestId);
      const newPath = select(".canvas").selectAll("g.links path")
      const {width, height} = newPath._groups[0][0].getBoundingClientRect();
      const xTranslation = isMiddleElement ? 0 : (indexToBreadthRatio > 0.5 ? -1 : 1)*(width * this._viewConfig.scale  + (this._viewConfig!.nodeRadius as number / 2)); 
      
      console.log('height *  :>> ', height * this._viewConfig.scale);
      console.log('height *  :>> ', this._viewConfig.margin);
      const yTranslation = (height) * this._viewConfig.scale  + (this._viewConfig!.nodeRadius as number)/ 2; 
      // const a = pathWidth?.getBoundingClientRect();
      console.log('pathWidth :>> ', width, height, xTranslation);
      select(".canvas").selectAll("g.links")
        .attr("transform", `translate(${xTranslation},${-yTranslation})`)
    } else {
      // select(".canvas").selectAll("g.links").remove();
    }

    // Helper function to determine the SVG path fragment based on node position
    function determinePathFragment(dx: number, dy: number, breadth: number) : any {
      if (dy === 0) {
        // Root node logic
        return [false, 'none']; // No path needed
      } else {
        // Child node logic
        if (breadth === 1) {
          return [ONE_CHILD, 'path-parent-one-child']; 
        } else if (breadth == 2) {
          return [dx == 0 ? TWO_CHILDREN_LEFT : TWO_CHILDREN_RIGHT, 'path-parent-two-children' + dx]; 
        } else if (breadth == 3) {
          return [THREE_CHILDREN, 'path-parent-three-children']; 
        }
      }
    }
  }

  resetForExpandedMenu({ justTranslation }) {
    // let newTranslate = this._viewConfig.defaultView.split` `;
    // if (this.type !== "radial") {
    //   newTranslate[0] = -(this._viewConfig.previousRenderZoom
    //     ? this._viewConfig.previousRenderZoom.x + this._viewConfig.margin.left
    //     : 0);
    //   newTranslate[1] = -(this._viewConfig.previousRenderZoom
    //     ? this._viewConfig.previousRenderZoom.y -
    //       this._viewConfig.defaultCanvasTranslateY() / 2
    //     : 0);
    // }
    // let newTranslateString = newTranslate.join(" ");
    // this.zoomBase()
    //   .transition()
    //   .duration(0)
    //   .ease(easeLinear)
    //   .attr("viewBox", newTranslateString);

    // this._zoomConfig.previousRenderZoom = {};

    // if (!justTranslation) {
    //   this.expand();
    //   this.activeNode.isNew = null;
    //   this.activeNode = this.rootData;
    //   document.querySelector(".the-node.active") &&
    //     document.querySelector(".the-node.active").classList.remove("active");
    // }
  }

  setLevelsHighAndWide() : void {
    if (this._viewConfig.isSmallScreen()) {
      this._viewConfig.levelsHigh = XS_LEVELS_HIGH;
      this._viewConfig.levelsWide = XS_LEVELS_WIDE;
    } else {
      this._viewConfig.levelsHigh = LG_LEVELS_HIGH;
      this._viewConfig.levelsWide = LG_LEVELS_WIDE;
    }
  }

  setdXdY() : void {
    this._viewConfig.dx =
      this._viewConfig.canvasWidth / (this._viewConfig.levelsHigh as number) - // Adjust for tree horizontal spacing on different screens
      +(this.type == VisType.Tree && this._viewConfig.isSmallScreen()) * 250 -
      +(this.type == VisType.Cluster && this._viewConfig.isSmallScreen()) * 210;
    this._viewConfig.dy =
      this._viewConfig.canvasHeight / (this._viewConfig.levelsWide as number);
    //adjust for taller aspect ratio
    this._viewConfig.dx *= this._viewConfig.isSmallScreen() ? 4.25 : 3.5;
    this._viewConfig.dy *= this._viewConfig.isSmallScreen() ? 3.25 : 3.5;
  }

  setNodeRadius() : void {
    this._viewConfig.nodeRadius =
      (this._viewConfig.isSmallScreen() ? XS_NODE_RADIUS : LG_NODE_RADIUS) * BASE_SCALE;
  }

  setZoomBehaviour() : void {
    const zooms = function (e) {
      let t = { ...e.transform };
      let scale;
      let x, y;
      if (
        false //e?.sourceEvent &&
        // this.type == "radial" && // If it's the first zoom, just zoom in a little programatically, not out to scale 1
        // ((Math.abs(t.k < 1.1) &&
        //   e.sourceEvent?.deltaY < 0 &&
        //   e.sourceEvent?.deltaY > -60) ||
        //   (t.k == 1 && t.x < 150 && t.y < 150))
      ) {
        // Radial needs an initial zoom in
        // t.k = this._viewConfig.clickScale;
        // this.zoomBase().call(
        //   this.zoomer.transform,
        //   Object.assign(e.transform, t)
        // );
        // return;
      }
      if (this._zoomConfig.focusMode) {
        this.resetForExpandedMenu({ justTranslation: true });
        this._zoomConfig.focusMode = false;
        return;
      } else {
        scale = t.k;
        x = t.x + this._viewConfig.defaultCanvasTranslateX(scale) * scale;
        y = t.y + this._viewConfig.defaultCanvasTranslateY(scale) * scale;
      }
      select(".canvas")
        .transition()
        .ease(easeLinear)
        .duration(200)
        .attr("transform", `translate(${x},${y}), scale(${scale})`);
      this._zoomConfig.focusMode = false;
    };

    this.zoomer = zoom().scaleExtent([0.5, 5]).on("zoom", zooms.bind(this));
    this.zoomBase().call(this.zoomer);
  }

  calibrateViewPortAttrs() : void {
    this._viewConfig.viewportW =
      this._viewConfig.canvasWidth * (this._viewConfig.levelsWide as number);
    this._viewConfig.viewportH =
      this._viewConfig.canvasHeight * (this._viewConfig.levelsHigh as number);

    this._viewConfig.viewportX = 0;
    this._viewConfig.viewportY = 0;

    this._viewConfig.defaultView = `${this._viewConfig.viewportX} ${this._viewConfig.viewportY} ${this._viewConfig.viewportW} ${this._viewConfig.viewportH}`;
  }

  calibrateViewBox() : void {
    this.zoomBase()
      .attr("viewBox", this._viewConfig.defaultView)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .on("dblclick.zoom", null);
  }

  static sumHierarchyData(data) : void {
    if (!data?.sum) return;
    data.sum((d) => {
      // Return a binary interpretation of whether the habit was completed that day
      // const thisNode = data.descendants().find((node) => node.data == d);
      // let content = parseTreeValues(thisNode.data.content);

      // if (content!.status === "") return 0;
      // if (content!.status === "OOB") return 0;

      // const statusValue = JSON.parse(content!.status);
      // return +statusValue;
      return 1
    });
  }

  static accumulateNodeValues(node) : void {
    if (!node?.descendants) return;
    while (node.descendants().some((node) => node.value > 1)) {
      // Convert node values to binary based on whether their descendant nodes are all completed
      node.each((node) => {
        if (node.value > 1) {
          node.value = cumulativeValue(node);
        }
      });
    }
  }

  activeOrNonActiveOpacity(d, dimmedOpacity : string) : string {
    if (
      !this.activeNode ||
      (!!this.activeNode &&
        [d]
          .concat(d?.parent?.children)
          .concat(d?.parent?._children)
          .concat(d?.children)
          .concat(d?._children)
          .concat(d?.parent)
          .map((d) => d?.data?.content?.name)
          .includes(this.activeNode.data.content.name))
    )
      return "1";

    return dimmedOpacity;
  }

  getLinkPathGenerator() : void {
    switch (this.type) {
      case VisType.Tree:
        //@ts-ignore
        return linkVertical()
        .x((d : any) => d.x)
        .y((d : any) => d.y);
        case VisType.Cluster:
        //@ts-ignore
        return linkHorizontal()
          .x((d : any) => d.y)
          .y((d : any) => d.x);
      // case "radial":
      //   return linkRadial()
      //     .angle((d) => d.x / 8)
      //     .radius((d) => d.y);
    }
  }

  setLayout() : void {
    switch (this.type) {
      case VisType.Tree:
        this.layout = tree()
          .size(
            [this._viewConfig.canvasWidth / 2,
            this._viewConfig.canvasHeight / 2]
          )
          .separation((a, b) => (3));
        this.layout.nodeSize([this._viewConfig.dx as number, this._viewConfig.dy as number]);
        break;
      // case VisType.Cluster:
      //   this.layout = cluster().size(
      //     this._viewConfig.canvasWidth,
      //     this._viewConfig.canvasHeight
      //   );
      //   this.layout.nodeSize([this._viewConfig.dx, this._viewConfig.dy]);
      //   break;
      // case "radial":
      //   this.layout = cluster()
      //     .size([360, this.canvasHeight * 2])
      //     .separation((a, b) => (a.parent == b.parent ? 0.5 : 0.01) / a.depth);

      //   this.layout.nodeSize(
      //     this._viewConfig.isSmallScreen()
      //       ? [300, 300]
      //       : [
      //           this.rootData.height > 4
      //             ? (this._viewConfig.canvasHeight / this.rootData.height) * 8
      //             : 400,
      //           this.rootData.height > 4
      //             ? (this._viewConfig.canvasHeight / this.rootData.height) * 8
      //             : 400,
      //         ]
      //   );
      //   break;
    }

    try {
      this.layout(this.rootData);
    } catch (error) {
      console.error("Failed layout data", this.rootData, "! ", error);
      console.error(error);
    }
  }

  setNodeAndLinkGroups() : void {
    const transformation = this.type == VisType.Radial ? `rotate(90)` : "";
    this._gLink = this._canvas
      .append("g")
      .classed("links", true)
      .attr("transform", transformation);
    this._gNode = this._canvas
      .append("g")
      .classed("nodes", true)
      .attr("transform", transformation);
  }
  
  setNodeAndLinkEnterSelections() : void {
    const nodes = this._gNode.selectAll("g.node").data(
      this.rootData.descendants().filter((d) => {
        const outOfBounds = outOfBoundsNode(d, this.rootData);
        // Set new active node when this one is out of bounds
        if (outOfBounds && this.activeNode?.data.name == d.data.name) {
          this.rootData.isNew = true;
          let newActive = this.rootData.find((n) => {
            return !n.data.content.match(/OOB/);
          });
          this.setActiveNode(newActive || this.rootData);
          this._zoomConfig.previousRenderZoom = { node: newActive };
        }

        return !outOfBounds;
      })
    ); // Remove habits that weren't being tracked then);
    this._enteringNodes = nodes
      .enter()
      .append("g")
      .attr("class", (d) => {
        return this.activeNode &&
          d.data.content === this.activeNode.data.content
          ? "the-node solid active"
          : "the-node solid";
      })
      .attr("data-testid", (d, i) => "test-node")
      .style("fill", (d) => {
        return nodeStatusColours(d);
      })
      .style("stroke", (d) =>
        nodeStatusColours(d) === positiveColLighter
          ? parentPositiveBorderCol
          : noNodeCol
      )
      .style("opacity", (d) =>
        this.type == VisType.Tree ? this.activeOrNonActiveOpacity(d, "0.5") : 1
      )
      .style("stroke-width", (d) =>
        // !!this.activeNode && d.ancestors().includes(this.activeNode)
        // TODO : memoize nodeStatus colours
        nodeStatusColours(d) === positiveColLighter
          ? "30px"
          : "1px"
      )
      .attr("transform", (d) => {
        if (this.type == VisType.Radial)
          return `rotate(${((d.x / 8) * 180) / Math.PI - 90}) translate(${
            d.y
          },0)`;
        return this.type == VisType.Cluster
          ? `translate(${d.y},${d.x})`
          : `translate(${d.x},${d.y})`;
      })
      .call(this.bindEventHandlers.bind(this));

    // Links
    const links = this._gLink.selectAll("line.link").data(
      this.rootData
        .links()
        .filter(
          ({ source, target }) =>
            !outOfBoundsNode(source, this.rootData) &&
            !outOfBoundsNode(target, this.rootData)
        ) // Remove habits that weren't being tracked then
    );
    this._enteringLinks = links
      .enter()
      .append("path")
      .classed("link", true)
      .attr("stroke-width", "3")
      .attr("stroke-opacity", (d) =>
        !this.activeNode ||
        (this.activeNode && this.activeNode.descendants().includes(d.source))
          ? 0.5
          : 0.3
      )
      .attr("d", this.getLinkPathGenerator())
      .attr("transform", (d) => {
        if (!d?.x) return "";
        if (this.type == VisType.Radial)
          return `rotate(${((d.x / 8) * 180) / Math.PI}) translate(${d.y},0)`;
        return "";
      });
  }

  setCircleAndLabelGroups() : void {
    this._gCircle = this._enteringNodes
      .append("g")
      .classed("node-subgroup", true)
      .attr("stroke-width", "0")
      .classed("checked", (d) => {
        if(!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const {checked} = this.nodeDetails[d.data.content];
        return checked
      })
      .attr("style", (d) => {
        if(!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const {scale} = this.nodeDetails[d.data.content];
        // return scale == 'Astro' ? "filter: saturate(0.45)" : "filter: brightness(1.25)"

      });
    this._gTooltip = this._enteringNodes
      .append("g")
      .classed("tooltip", true)
        .append("foreignObject")
        .attr("x", "-295")
        .attr("y", "-45")
        .attr("width", "550")
        .style("overflow", "visible")
        .attr("height", "550")
        .html((d) => {
        if(!d?.data?.content || !this.nodeDetails[d.data.content]) return
          const {name, description, scale} = this.nodeDetails[d.data.content];
          return `<div class="tooltip-inner">
          <div class="content">
          <span class="title">Name:</span>
          <p>${name}</p>
          <span class="title">Description:</span>
          <p>${description} - ${scale}</p>
          </div>
        </div>`
        });
      // .classed("hidden", this.type == VisType.Radial)
      // .attr(
      //   "transform",
      //   `translate(${this._viewConfig.nodeRadius as number / 10}, ${
      //     this._viewConfig.nodeRadius
      //   }), scale(${
      //     this._viewConfig.isSmallScreen() ? XS_LABEL_SCALE : LG_LABEL_SCALE
      //   })`
      // )
      // .attr("opacity", (d) => "1");//this.activeOrNonActiveOpacity(d, "0"));
  }

  setButtonGroups() {
    this._gButton = this._gTooltip.select(".tooltip-inner")
      .append("g")
      .classed("tooltip-actions", true)
        .append("foreignObject")
        .attr("width", "550")
        .style("overflow", "visible")
        .attr("height", "550")
        .html((d) => {
          if(!d?.data?.content || !this.nodeDetails[d.data.content]) return
          const { checked, scale } = this.nodeDetails[d.data.content];
          return `<div class="buttons">
          <button class="tooltip-action-button higher-button ${scale !== 'Astro' ? '' : 'hide'}"></button>
          <button class="tooltip-action-button checkbox-button ${checked ? 'checked' : ''}"></button>
          <button class="tooltip-action-button lower-button"></button>
        </div>`
      });
      // .classed("habit-label-dash-button", true)
      // .attr(
      //   "transform",
      //   (d) =>
      //     `translate(0, 0), scale(${
      //       this._viewConfig.isSmallScreen()
      //         ? this.type == VisType.Radial
      //           ? XS_BUTTON_SCALE * 1.15
      //           : XS_BUTTON_SCALE
      //         : this.type == VisType.Radial
      //         ? LG_BUTTON_SCALE / 1.15
      //         : LG_BUTTON_SCALE
      //     })` +
      //     (this.type == VisType.Radial
      //       ? `, rotate(${450 - ((d.x / 8) * 180) / Math.PI - 90})`
      //       : "")
      // )
      // .attr("style", "opacity: 0");
  }

  appendCirclesAndLabels() : void {
    this._gCircle
      .html((d) => {
        if(!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const {scale} = this.nodeDetails[d.data.content];
        switch (scale) {
          case 'Astro':
            return `
            <circle cx="76.7949" cy="70.625" r="65.5" fill-opacity="1"/>
            <circle cx="76.7949" cy="70.625" r="55.5" fill="#89BFF2" stroke="#004955" stroke-width="6"/>
            <mask id="mask0_348_25124" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="24" y="18" width="106" height="106">
            <circle cx="76.7949" cy="70.625" r="52.5" fill="#D2E1FB"/>
            </mask>
            <g mask="url(#mask0_348_25124)">
            <circle cx="64.7949" cy="70.625" r="52.5" fill="#D2E1FB"/>
            </g>
            <mask id="mask1_348_25124" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="24" y="18" width="106" height="106">
            <circle cx="76.7949" cy="70.625" r="52.5" fill="#89BFF2"/>
            </mask>
            <g mask="url(#mask1_348_25124)">
            <circle cx="91.7949" cy="23.375" r="6.75" transform="rotate(-90 91.7949 23.375)" fill="#C5E0EF" stroke="#004955" stroke-width="4.5"/>
            <circle cx="82.0449" cy="120.875" r="7.5" transform="rotate(-90 82.0449 120.875)" stroke="#004955" stroke-width="4.5"/>
            </g>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M59.0703 32.4105C59.0703 30.1906 56.8097 28.7003 54.8602 29.7622C44.9418 35.1645 37.2084 44.0726 33.3245 54.8222C32.6407 56.7148 34.1072 58.6251 36.1196 58.6251C37.4623 58.6251 38.6374 57.7461 39.1061 56.4879C42.4836 47.4218 49.0157 39.8917 57.3678 35.2323C58.3974 34.6579 59.0703 33.5895 59.0703 32.4105ZM77.0703 117.125L77.0236 117.125H77.1169L77.0703 117.125Z" fill="white"/>
            <circle cx="32.8203" cy="65.375" r="3" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M24.6149 59.4905C25.2582 59.093 25.7173 58.4618 25.903 57.7287C26.5385 55.2207 23.8886 52.8955 21.6837 54.2492C7.11599 63.1931 -1.15814 73.9423 0.610823 83.9746C3.89815 102.618 40.6236 111.726 82.6395 104.317C124.655 96.9086 156.051 75.7893 152.764 57.146C152.056 53.1326 149.799 49.5611 146.273 46.5012C144.974 45.3743 143.013 45.7825 142.096 47.2367L140.796 49.298C140.671 49.4947 140.723 49.7536 140.91 49.8915C144.61 52.6164 146.373 55.453 146.855 58.1878C147.337 60.9227 146.651 64.1911 144.106 68.017C141.538 71.8783 137.271 75.9775 131.341 79.9661C119.496 87.9341 101.978 94.8146 81.5976 98.4082C61.2174 102.002 42.4021 101.528 28.5462 98.0917C21.61 96.3716 16.1982 93.979 12.4643 91.229C8.76461 88.5041 7.0019 85.6676 6.51967 82.9327C6.03744 80.1978 6.72368 76.9295 9.26831 73.1036C11.8364 69.2423 16.1036 65.1431 22.0331 61.1544C22.866 60.5942 23.7269 60.0393 24.6149 59.4905ZM136.792 44.3987C135.978 45.6888 134.334 46.1625 132.918 45.5957C130.511 44.6324 127.811 43.7685 124.828 43.0289C123.929 42.8058 123.008 42.5952 122.068 42.3974C121.329 42.2419 120.681 41.8005 120.257 41.1751C118.804 39.032 120.51 35.9466 123.045 36.472C127.633 37.423 131.82 38.6644 135.514 40.1734C137.18 40.8539 137.752 42.8768 136.792 44.3987Z" fill="#004955"/>
            <mask id="mask2_348_25124" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="18" y="12" width="118" height="118">
            <circle cx="76.7949" cy="70.625" r="55.5" fill="#89BFF2" stroke="#332D57" stroke-width="6"/>
            </mask>
            <g mask="url(#mask2_348_25124)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M84.6659 80.0483C84.0911 82.1933 85.9486 84.2014 88.1222 83.7467C119.662 77.1491 144.303 62.8723 151.117 48.2663C152.165 46.019 150.001 43.9551 147.606 44.597C146.586 44.8701 145.768 45.611 145.276 46.5445C144.94 47.1803 144.552 47.833 144.106 48.5029C141.538 52.3642 137.271 56.4634 131.342 60.452C120.557 67.7067 105.069 74.06 86.9999 77.8517C85.871 78.0886 84.9644 78.9341 84.6659 80.0483ZM18.3701 80.5828C18.5442 79.933 17.938 79.3414 17.2881 79.5155C16.4899 79.7294 16.3768 80.8077 17.1372 81.1313C17.159 81.1406 17.1808 81.1499 17.2027 81.1591C17.6857 81.3639 18.2343 81.0895 18.3701 80.5828Z" fill="#004955"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M101.362 106.574C100.741 108.891 102.916 110.971 105.18 110.176C126.524 102.676 142.298 91.6429 147.537 80.4148C148.586 78.1675 146.422 76.1019 144.027 76.7438C143.007 77.0169 142.189 77.7578 141.697 78.6913C141.361 79.3271 140.973 79.9799 140.527 80.6497C137.959 84.511 133.692 88.6102 127.762 92.5989C121.198 97.0144 112.892 101.096 103.322 104.469C102.362 104.807 101.625 105.592 101.362 106.574ZM32.7769 115.651C33.241 113.919 32.0853 112.175 30.3201 111.86C28.4645 111.528 26.6781 111.149 24.9673 110.724C23.9798 110.48 23.0233 110.221 22.098 109.95C21.4823 109.769 20.8289 109.755 20.2091 109.921C17.1642 110.737 16.887 114.648 19.9054 115.558C22.8689 116.45 26.062 117.2 29.4516 117.799C30.9487 118.064 32.3834 117.12 32.7769 115.651Z" fill="#004955"/>
            </g>
            <circle cx="135.295" cy="111.125" r="4.5" fill="#004955"/>
            <circle cx="77.5449" cy="83.375" r="3" transform="rotate(-90 77.5449 83.375)" fill="#004955"/>
            <circle cx="41.5449" cy="87.875" r="5.25" transform="rotate(-90 41.5449 87.875)" fill="#D2E1FB" stroke="#004955" stroke-width="4.5"/>
            `
              
          case 'Sub':
          case 'Atom':
            return `<ellipse cx="77.7602" cy="67.5" rx="65.5" ry="67.5" fill-opacity="1"/>
            <path d="M133.26 67.5C133.26 98.1518 108.412 123 77.7597 123C47.1079 123 22.2598 98.1518 22.2598 67.5C22.2598 36.8482 47.1079 12 77.7597 12C108.412 12 133.26 36.8482 133.26 67.5Z" fill="#8C12DC" stroke="#004955" stroke-width="6"/>
            <mask id="mask0_348_24970" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="25" y="15" width="106" height="105">
            <ellipse cx="77.7597" cy="67.5" rx="52.5" ry="52.5" fill="#B341FF"/>
            </mask>
            <g mask="url(#mask0_348_24970)">
            <ellipse cx="65.7597" cy="67.5" rx="52.5" ry="52.5" fill="#B341FF"/>
            </g>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M59.7596 29.2855C59.7596 27.0656 57.499 25.5753 55.5495 26.6372C45.6312 32.0395 37.8979 40.9476 34.0139 51.6971C33.3301 53.5897 34.7967 55.5001 36.809 55.5001C38.1517 55.5001 39.3268 54.6211 39.7955 53.3629C43.173 44.2968 49.7051 36.7667 58.0572 32.1073C59.0867 31.5329 59.7596 30.4645 59.7596 29.2855Z" fill="white"/>
            <ellipse cx="33.5098" cy="62.25" rx="3" ry="3" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M131.639 24.6087C131.529 20.0151 130.217 16.9442 128.253 14.9805C126.289 13.0168 123.218 11.7043 118.625 11.5943C113.989 11.4833 108.183 12.6275 101.515 15.1969C99.7772 15.8665 97.9992 16.6258 96.1885 17.4725C95.5234 17.7835 94.7665 17.8254 94.0686 17.5974C91.5936 16.7884 91.072 13.2489 93.428 12.1401C110.217 4.23891 124.892 3.13462 132.496 10.7379C145.882 24.1241 132.277 59.4318 102.109 89.5998C71.9415 119.768 36.6338 133.372 23.2476 119.986C16.2493 112.988 16.628 99.9977 22.8939 84.8831C23.8995 82.4573 27.4881 82.8595 28.3799 85.3293C28.6249 86.008 28.6121 86.7522 28.3379 87.4196C28.1193 87.9517 27.9089 88.4804 27.7066 89.0054C25.1372 95.6737 23.993 101.479 24.104 106.115C24.214 110.709 25.5266 113.78 27.4902 115.743C29.4539 117.707 32.5248 119.019 37.1184 119.129C41.7543 119.24 47.5597 118.096 54.2281 115.527C67.5491 110.394 83.2335 99.9904 97.8668 85.3571C112.5 70.7238 122.904 55.0394 128.037 41.7184C130.606 35.05 131.75 29.2446 131.639 24.6087Z" fill="#004955"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M57.6228 97.1443C56.9651 98.187 55.727 98.7179 54.5212 98.4613C22.3712 91.6216 -0.330016 76.3137 1.04296 60.6206C1.9242 50.5479 12.5451 42.3538 28.7259 37.4715C31.2066 36.7229 33.1807 39.6483 31.9177 41.911C31.5507 42.5687 30.9431 43.0677 30.2227 43.2874C29.3427 43.5558 28.4821 43.8342 27.6416 44.1225C20.8818 46.4406 15.6991 49.2957 12.2191 52.3607C8.77094 55.3976 7.26216 58.377 7.02012 61.1435C6.77809 63.91 7.74658 67.1061 10.615 70.6957C13.5099 74.3184 18.118 78.0301 24.3726 81.4868C32.6509 86.0619 43.3685 89.9444 55.6551 92.5683C57.7145 93.0082 58.7463 95.3632 57.6228 97.1443ZM65.3548 96.1327C65.9911 95.124 67.1603 94.5856 68.343 94.7401C70.7011 95.0482 73.0999 95.3103 75.5344 95.5233C96.1503 97.3269 114.853 95.2149 128.356 90.5842C135.116 88.2661 140.299 85.411 143.779 82.346C147.227 79.3091 148.736 76.3297 148.978 73.5632C149.22 70.7967 148.251 67.6006 145.383 64.011C142.488 60.3883 137.88 56.6766 131.625 53.2199C130.927 52.834 130.212 52.4532 129.479 52.0775C128.321 51.4832 127.436 50.4663 126.984 49.2453C126.185 47.0925 128.335 44.8307 130.401 45.8328C146.274 53.5317 155.861 63.725 154.955 74.0861C153.305 92.9451 117.513 105.219 75.0115 101.5C72.4547 101.277 69.9319 101 67.4486 100.674C65.2943 100.391 64.1956 97.9704 65.3548 96.1327Z" fill="#004955"/>
            <ellipse cx="74.7598" cy="78.75" rx="3" ry="3" transform="rotate(-90 74.7598 78.75)" fill="#004955"/>
            <ellipse cx="67.2598" cy="71.25" rx="3.75" ry="3.75" transform="rotate(-90 67.2598 71.25)" fill="#004955"/>
            <ellipse cx="65.0098" cy="81.75" rx="1.5" ry="1.5" transform="rotate(-90 65.0098 81.75)" fill="#004955"/>
          `
        }
      })
      .on("mouseenter", this.eventHandlers.handleHover.bind(this));
  }

  appendLabels() : void {
    this._gTooltip
      .append("rect")
      .attr("width", 3)
      .attr("height", 45)
      .attr("x", -6)
      .attr("y", -25);

    this._gTooltip
      .append("div")
      .attr("width", this.type == VisType.Radial ? 130 : 275)
      .attr("height", 100)
      .attr("x", -6)
      .attr("y", -10);

    // Split the name label into two parts:
    this._gTooltip
      .append("text")
      .attr("x", 5)
      .attr("y", 20)
      .text((d) => {
        return d.data.name
      })
      .attr("transform", (d) => {
        return this.type == VisType.Radial
          ? `scale(0.75), translate(${
              d.x < Math.PI / 2 ? "130, 100" : "0,0"
            }), rotate(${0})`
          : "";
      });
    this._gTooltip
      .append("text")
      .attr("x", 5)
      .attr("y", 50)
      .text((d) => {
        const allWords = d.data.name.split(" ");
        const words = allWords.slice(0, 6);
        return `${words[4] || ""} ${words[5] || ""} ${words[6] || ""} ${
          allWords.length > 7 ? "..." : ""
        }`;
      });

    // this._enteringNodes
    //   .append("g")
    //   .attr(
    //     "transform",
    //     "translate(" +
    //       (this.type == VisType.Radial ? -10 : -35) +
    //       "," +
    //       (this.type == VisType.Tree ? -25 : this.type == VisType.Radial ? -30 : 5) +
    //       ") scale( " +
    //       this._viewConfig.scale * 1.5 +
    //       ") rotate(" +
    //       (this.type == VisType.Cluster ? 270 : this.type == VisType.Radial ? 270 : 0) +
    //       ")"
    //   )
    //   .append("path")
    //   .attr("class", "expand-arrow")
    //   .attr("d", (d) => {
    //     return d._children
    //       ? "M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
    //       : null;
    //   });
  }
  appendButtons() {
    const delBtnG = this._gButton.append("g");
    delBtnG
      .append("path")
      .attr("d", "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z")
      .attr("fill", "#e06a58")
      .attr("display", (d) => (d.depth === 0 ? "none" : "initial"))
      .on("click", this.eventHandlers.handleDeleteNode.bind(this));

      // this._gButton
      //   .append("rect")
      //   .attr("rx", 15)
      //   .attr("y", -30)
      //   .attr("width", 90)
      //   .attr("height", 30)
      //   .on("click", (e) => {
      //     e.stopPropagation();
      //   });
      // this._gButton
      //   .append("text")
      //   .attr("x", 15)
      //   .attr("y", (d) => (d.parent ? -8 : -5))
      //   .text((d) => "DIVIDE")
      //   .on("click", (e, n) => {
      //     if (
      //       // isTouchDevice() ||
      //       select(e?.target?.parentNode).attr("style").match("opacity: 0")
      //     )
      //       return e.stopPropagation();
      //     this.setCurrentHabit(n);
      //     this.eventHandlers.handleAppendNode.call(this);
      //   });
      // this._gButton
      //   .append("rect")
      //   .attr("style", (d) => (d.parent ? "opacity: 0" : "opacity: 1"))
      //   .attr("rx", 15)
      //   .attr("y", -55)
      //   .attr("width", 90)
      //   .attr("height", 30)
      //   .on("click", (e) => {
      //     e.stopPropagation();
      //   });
      // this._gButton
      //   .append("text")
      //   .attr("style", (d) => (d.parent ? "opacity: 0" : "opacity: 1"))
      //   .attr("x", 12)
      //   .attr("y", -30)
      //   .text("EXPAND")
      //   .on("click", (e, n) => {
      //     if (
      //       // isTouchDevice() ||
      //       select(e?.target?.parentNode).attr("style").match("opacity: 0")
      //     )
      //       return e.stopPropagation();
      //     this.setCurrentHabit(n);
      //     // this.eventHandlers.handlePrependNode.call(this, e, n);
      //   });
  }

  bindEventHandlers(selection) {
    selection
      .on("contextmenu", this.eventHandlers.rgtClickOrDoubleTap)
      .on("click", (e, d) => {
        if (e.target.tagName !== "BUTTON") return;

        this.eventHandlers.handleNodeFocus.call(this, e, d);
        switch (true) {
          case e.target.classList.contains('checkbox-button'):
            if(!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.nodeDetails[d.data.content].checked = !this.nodeDetails[d.data.content];
            e.target.classList.toggle('checked');
            e.target.closest('.the-node').firstChild.classList.toggle('checked');
            break;
        
          case e.target.classList.contains('lower-button'):
            if(!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.eventHandlers.handleAppendNode.call(this, {parentOrbitEh: this.nodeDetails[d.data.content].eH as string})
            break;
        
          default:
            break;
        }
        // if (!this._gLink.attr("transform"))
        //   // If it is not a radial vis
        //   this.eventHandlers.handleNodeZoom.call(this, e, d, false);
      })
      // .on("touchstart", this.eventHandlers.handleHover.bind(this), {
      //   passive: true,
      // })
      // .on("mouseleave", this.eventHandlers.handleMouseLeave.bind(this))
      // .on(
      //   "mouseenter",
      //   debounce(this.eventHandlers.handleMouseEnter.bind(this), 450)
      // );
  }

  bindMobileEventHandlers(selection) {
    this._manager = propagating(
      new Hammer.Manager(document.body, { domEvents: true })
    );
    // Create a recognizer
    const singleTap = new Hammer.Tap({ event: "singletap" });
    const doubleTap = new Hammer.Tap({
      event: "doubletap",
      taps: 2,
      interval: 800,
    });
    this._manager.add([doubleTap, singleTap]);
    doubleTap.recognizeWith(singleTap);
    singleTap.requireFailure(doubleTap);
    //----------------------
    // Mobile device events
    //----------------------
    selection.selectAll(".node-subgroup").on("touchstart", (e) => {
      this._manager.set({ inputTarget: e.target });
    });

    this._manager.on("doubletap", (ev) => {
      ev.srcEvent.preventDefault();
      ev.srcEvent.stopPropagation();
      // if (!isTouchDevice()) return;

      const target = ev.firstTarget;
      if (!target || target?.tagName !== "circle") return;

      ev.srcEvent.stopPropagation();

      let node = target?.__data__;
      if (typeof node == "number") {
        node = ev.target.parentNode?.__data__;
      }
      try {
        this.eventHandlers.rgtClickOrDoubleTap.call(this, ev.srcEvent, node);
      } catch (error) {
        console.log("Problem with mobile doubletap: ", error);
      }
    });

    this._manager.on("singletap", (ev) => {
      ev.srcEvent.preventDefault();
      if (
        // !isTouchDevice() ||
        ev.srcEvent.timeStamp === this.currentEventTimestamp || // Guard clause for callback firing twice
        select(`#${this._svgId}`).empty() // Guard clause for wrong vis element
      )
        return;
      this.currentEventTimestamp = ev.srcEvent.timeStamp;

      let target = ev.target;
      const node = target?.__data__;
      if (!target || !node) return;

      switch (ev?.target?.tagName) {
        // Delete button is currently the only path
        case "path":
          this.eventHandlers.handleDeleteNode.call(this, ev, node.data);
          break;
        //@ts-ignore
        case "rect":
          if (target.parentNode.classList.contains("tooltip")) return; // Stop label from triggering
        // Append or prepend are currently the only text
        case "text":
          const buttonTransitioning =
            select(target.parentNode).attr("style") === "opacity: 0";
          if (buttonTransitioning) return ev.srcEvent.stopPropagation();
          this.setCurrentHabit(node.data);

          // target.textContent == "DIVIDE"
          //   ? this.eventHandlers.handleAppendNode.call(this)
          //   : this.eventHandlers.handlePrependNode.call(this);
          break;
        default:
          let parentNodeGroup = _.find(this._enteringNodes._groups[0], (n) => {
            return n?.__data__?.data?.content == node?.data?.content;
          });
          target = parentNodeGroup;
          try {
            this.eventHandlers.handleMouseEnter.call(this, ev);
            this.eventHandlers.handleNodeFocus.call(this, ev.srcEvent, node);
            if (!this._gLink.attr("transform"))
              this.eventHandlers.handleNodeZoom.call(
                this,
                ev.srcEvent,
                node,
                false
              );
            break;
          } catch (error) {
            console.error(error);
          }
      }
    });
  }

  bindLegendEventHandler() {
    // let infoCell = document.querySelector(".help-svg");
    // infoCell?.addEventListener("click", () => {
    //   store.dispatch(toggleConfirm({ type: "Instructions" }));
    // });
  }

  addLegend() {
    const labels = [
      "Complete",
      "Incomplete",
      "Sub-Incomplete",
      // "Not Yet Tracked",
      "Out of Bounds",
    ];
    const legendScale = this._viewConfig.isSmallScreen()
      ? BASE_SCALE / 3.5
      : BASE_SCALE / 2;
    const ordinal = scaleOrdinal().domain(labels).range([
      positiveCol,
      negativeCol,
      positiveColLighter,
      // neutralCol,
      noNodeCol,
    ]);

    const legendSvg = select("svg.legend-svg");
    const gLegend = legendSvg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(5, ${
          this._viewConfig.isSmallScreen() ? 55 : 25
        }) scale(${legendScale})`
      );

    const legend = legendColor()
      .orient("horizontal")
      .labels(labels)
      .orient("vertical")
      .shape("circle")
      .shapeRadius(14)
      .shapePadding(-5)
      .scale(ordinal);

    gLegend.call(legend as any);
  }

  // setNodeAnimationGroups() {
  //   this.gCirclePulse = this._canvas?.selectAll(
  //     "g.the-node.solid.active g.node-subgroup"
  //   );

  //   this.gCirclePulse.pulseScale = scaleLinear()
  //     // .range(["#1a140e", "#5568d2", "#3349c1"])
  //     .domain([0, 3 * (this._viewConfig.nodeRadius as number)]);

  //   this.gCirclePulse.pulseData = [
  //     0,
  //     this._viewConfig.nodeRadius,
  //     this._viewConfig.nodeRadius as number * 2,
  //   ];

  //   this.gCirclePulse.pulseCircles = this.gCirclePulse
  //     .insert("g", ".habit-label-dash-button")
  //     .classed("active-circle", true)
  //     .attr("stroke-opacity", "0.8")
  //     .selectAll("circle")
  //     .data(this.gCirclePulse.pulseData)
  //     .enter()
  //     .insert("circle", ".habit-label-dash-button")
  //     .attr("r", function (d) {
  //       return d;
  //     })
  //     .attr("fill", "none")
  //     .style("stroke-width", "4")
  //     .style("stroke", this.gCirclePulse.pulseScale);
  // }

  activateNodeAnimation = debounce(() => {
    // https://stackoverflow.com/questions/45349849/concentric-emanating-circles-d3
    // Credit: Andrew Reid

    // _p("animated node", this.activeNode, "!");
    this.zoomBase().selectAll(".active-circle").remove();
    // this.setNodeAnimationGroups();

    let data = this.gCirclePulse.pulseData
      .map((d) => {
        return d == 2 * (this._viewConfig.nodeRadius as number)
          ? 0
          : d + this._viewConfig.nodeRadius;
      })
      .slice(0, -2);

    // Grow circles
    this.gCirclePulse.pulseCircles
      .data(data)
      .filter(function (d) {
        return d > 0;
      })
      .transition()
      .ease(easeCubic)
      .attr("r", function (d) {
        return d;
      })
      .style("stroke", this.gCirclePulse.pulseScale)
      .style("opacity", (d) => {
        return d == 3 * (this._viewConfig.nodeRadius as number) ? 0 : 1;
      })
      .duration(200);

    //  pulseCircles where r == 0
    this.gCirclePulse.pulseCircles
      .filter(function (d) {
        return d == 0;
      })
      .attr("r", 0)
      .style("opacity", 1)
      .style("stroke", this.gCirclePulse.pulseScale);
  }, 800);

  render() {
    if (this.noCanvas()) {
      this._canvas = select(`#${this._svgId}`)
      .append("g")
      .classed("canvas", true);
    }

    if (this.firstRender()) {
      this.setNodeRadius();
      this.setLevelsHighAndWide();
      this.calibrateViewPortAttrs();
      this.calibrateViewBox();
      this.setdXdY();
      this.setZoomBehaviour();
    }

    if (
      this.firstRender() ||
      this.hasNewHierarchyData() ||
      this.isNewActiveNode ||
      this.isCollapsed ||
      this.isExpanded
    ) {
      // First render OR New hierarchy needs to be rendered

      // Update the current day's rootData
      if (this.hasNextData()) this.rootData = this._nextRootData;
      if (this.hasSummedData()) delete this._nextRootData;

      if (!this.activeNode) console.log("Need new active node", {});

      if (this.noCanvas()) return;

      //Render cleared canvas for OOB dates
      const isBlankData = this.rootData?.data?.content == "";
      if (isBlankData) {
        console.log("Rendered blank :>> ");
        this.clearCanvas(false);
        return;
      }
      const translationNeeded = !!this.rootData._translationCoords;
      this.clearCanvas(translationNeeded);
      console.log('debug this.rootData._translationCoords :>> ', this.rootData._translationCoords);
      console.log('debug this.nextrootData._translationCoords :>> ', this?._nextRootData?._translationCoords);
      translationNeeded && this.translateLinks(this.rootData._translationCoords);

      // _p("Cleared canvas :>> ");

      this.setLayout();
      if (typeof this.rootData.newHabitDatesAdded == "undefined") {
        this.addHabitDatesForNewNodes();
      }
      !this.hasSummedData() && accumulateTree(this.rootData, this);

      // _p("Formed new layout", this, "!");

      this.setNodeAndLinkGroups();
      this.setNodeAndLinkEnterSelections();
      this.setCircleAndLabelGroups();
      this.setButtonGroups();

      console.log("Appended and set groups... :>>", {});

      this.appendCirclesAndLabels();
      this.appendLabels();
      this.appendButtons();
      
      if (!!this.activeNode) {
        // this?.isNewActiveNode &&
        //   this.zoomBase().selectAll(".active-circle").remove();
      } else {
        // Set a default active node
        this.isNewActiveNode = true;
        let newActive = this.rootData.find((n) => {
          return !n.data.content.match(/OOB/);
        });
        // console.log("New active node", newActive);
        try {
          this.setCurrentHabit(newActive);
          this.setCurrentNode(newActive);
          !this._zoomConfig.zoomedInView() &&
            this.setActiveNode(newActive?.data);
        } catch (err) {
          console.error("No active habits for this date");
        }
      }
      // this.activateNodeAnimation();
      // console.log("Appended SVG elements... :>>");
      this.eventHandlers.handleNodeZoom.call(this, null, this.activeNode);
      // console.log("this.activeNode", this.activeNode);
      // console.log("this.activeNode.isNewActive", this.isNewActiveNode);

      this._viewConfig.isSmallScreen() &&
        this.bindMobileEventHandlers(this._enteringNodes);

      this._canvas.attr(
        "transform",
        `scale(${BASE_SCALE}), translate(${this._viewConfig.defaultCanvasTranslateX()}, ${this._viewConfig.defaultCanvasTranslateY()})`
      );

      this._hasRendered = true;
    }

    if (!select("svg.legend-svg").empty() && select("svg .legend").empty()) {
      console.log("Added legend :>> ");
      this.addLegend();
      this.bindLegendEventHandler();
    }
  }
}

export function accumulateTree(json, thisArg) {
  try {
    BaseVisualization.sumHierarchyData.call(null, json);
    BaseVisualization.accumulateNodeValues.call(thisArg, json);
    // TODO memoise
  } catch (error) {
    console.error("Could not manipulate tree: ", error);
  }
}
