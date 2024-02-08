import {
  select,
  scaleOrdinal,
  scaleLinear,
  zoom,
  linkVertical,
  linkRadial,
  linkHorizontal,
  tree,
  cluster,
  easeCubic,
  easePolyIn,
  easeLinear,
  hierarchy,
  TreeLayout,
} from "d3";
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


export default class BaseVisualization implements IVisualization {
  type: VisType;
  _svgId: string;
  _canvas: any;
  _manager: any;
  zoomer: any;
  rootData: any; // Replace 'any' with a more specific type representing the input tree structure
  _nextRootData: any; // Replace 'any' with a more specific type representing the input tree structure
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

  constructor(type, svgId, inputTree, canvasHeight, canvasWidth, margin: Margins) {
    this.type = type;
    this._svgId = svgId;
    this.rootData = inputTree;
    
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
          ? initialX +
              (newXTranslate(this.type, this._viewConfig, this._zoomConfig) as number)
          : initialX;
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
          : initialY;
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
        // store.dispatch(toggleConfirm({ type: "Prepend" }));
      },
      handleAppendNode: function () {
        // store.dispatch(toggleConfirm({ type: "Append" }));
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
        // this.currentTooltip = select(d).selectAll("g.tooltip");
        // this.currentTooltip.transition().duration(450).style("opacity", "1");
        // this.currentButton = select(d).selectAll("g.habit-label-dash-button");
        // this.currentButton
        //   .transition()
        //   .delay(100)
        //   .duration(450)
        //   .style("opacity", "1");
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
    this.activateNodeAnimation();
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
    const strokeWidth = 3;
console.log('dx, dy, breadth :>> ', dx, dy, breadth);

    const fullWidth = (this._viewConfig!.dx as number * (this._viewConfig!.levelsWide as number)) / breadth;
    console.log('object :>> ', fullWidth) 
    const x = dx == 0 ? fullWidth + (this._viewConfig!.nodeRadius as number)  * 2 as any : -(fullWidth + (this._viewConfig!.nodeRadius as number)  * 2 as any);
    const y = -(this._viewConfig!.dy as number * this._viewConfig.scale) + (this._viewConfig!.nodeRadius as number)  * 2 as any;
    select(".canvas").selectAll("g.links").attr("transform", "translate(" + (x + strokeWidth) + ", " + (y + strokeWidth) + ")");
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
console.log('this._viewConfig :>> ', this._viewConfig);
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
      .classed("node-subgroup", true);
    this._gTooltip = this._enteringNodes
      .append("g")
      .classed("tooltip", true)
      // .classed("hidden", this.type == VisType.Radial)
      .attr(
        "transform",
        `translate(${this._viewConfig.nodeRadius as number / 10}, ${
          this._viewConfig.nodeRadius
        }), scale(${
          this._viewConfig.isSmallScreen() ? XS_LABEL_SCALE : LG_LABEL_SCALE
        })`
      )
      .attr("opacity", (d) => this.activeOrNonActiveOpacity(d, "0"));
  }

  setButtonGroups() {
    this._gButton = this._gCircle
      .append("g")
      .classed("habit-label-dash-button", true)
      .attr(
        "transform",
        (d) =>
          `translate(0, 0), scale(${
            this._viewConfig.isSmallScreen()
              ? this.type == VisType.Radial
                ? XS_BUTTON_SCALE * 1.15
                : XS_BUTTON_SCALE
              : this.type == VisType.Radial
              ? LG_BUTTON_SCALE / 1.15
              : LG_BUTTON_SCALE
          })` +
          (this.type == VisType.Radial
            ? `, rotate(${450 - ((d.x / 8) * 180) / Math.PI - 90})`
            : "")
      )
      .attr("style", "opacity: 0");
  }

  appendCirclesAndLabels() : void {
    this._gCircle
      .insert("circle", "g")
      .attr("r", this._viewConfig.nodeRadius)
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
        console.log('d :>> ', d);
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

      this._gButton
        .append("rect")
        .attr("rx", 15)
        .attr("y", -30)
        .attr("width", 90)
        .attr("height", 30)
        .on("click", (e) => {
          e.stopPropagation();
        });
      this._gButton
        .append("text")
        .attr("x", 15)
        .attr("y", (d) => (d.parent ? -8 : -5))
        .text((d) => "DIVIDE")
        .on("click", (e, n) => {
          if (
            // isTouchDevice() ||
            select(e?.target?.parentNode).attr("style").match("opacity: 0")
          )
            return e.stopPropagation();
          this.setCurrentHabit(n);
          this.eventHandlers.handleAppendNode.call(this);
        });
      this._gButton
        .append("rect")
        .attr("style", (d) => (d.parent ? "opacity: 0" : "opacity: 1"))
        .attr("rx", 15)
        .attr("y", -55)
        .attr("width", 90)
        .attr("height", 30)
        .on("click", (e) => {
          e.stopPropagation();
        });
      this._gButton
        .append("text")
        .attr("style", (d) => (d.parent ? "opacity: 0" : "opacity: 1"))
        .attr("x", 12)
        .attr("y", -30)
        .text("EXPAND")
        .on("click", (e, n) => {
          if (
            // isTouchDevice() ||
            select(e?.target?.parentNode).attr("style").match("opacity: 0")
          )
            return e.stopPropagation();
          this.setCurrentHabit(n);
          // this.eventHandlers.handlePrependNode.call(this, e, n);
        });
  }

  bindEventHandlers(selection) {
    selection
      .on("contextmenu", this.eventHandlers.rgtClickOrDoubleTap)
      .on("click", (e, d) => {
        // if (isTouchDevice()) return;

        if (e.target.tagName !== "circle") return;

        this.eventHandlers.handleNodeFocus.call(this, e, d);

        if (!this._gLink.attr("transform"))
          // If it is not a radial vis
          this.eventHandlers.handleNodeZoom.call(this, e, d, false);
      })
      .on("touchstart", this.eventHandlers.handleHover.bind(this), {
        passive: true,
      })
      .on("mouseleave", this.eventHandlers.handleMouseLeave.bind(this))
      .on(
        "mouseenter",
        debounce(this.eventHandlers.handleMouseEnter.bind(this), 450)
      );
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

          target.textContent == "DIVIDE"
            ? this.eventHandlers.handleAppendNode.call(this)
            : this.eventHandlers.handlePrependNode.call(this);
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

  setNodeAnimationGroups() {
    this.gCirclePulse = this._canvas?.selectAll(
      "g.the-node.solid.active g.node-subgroup"
    );

    this.gCirclePulse.pulseScale = scaleLinear()
      // .range(["#1a140e", "#5568d2", "#3349c1"])
      .domain([0, 3 * (this._viewConfig.nodeRadius as number)]);

    this.gCirclePulse.pulseData = [
      0,
      this._viewConfig.nodeRadius,
      this._viewConfig.nodeRadius as number * 2,
    ];

    this.gCirclePulse.pulseCircles = this.gCirclePulse
      .insert("g", ".habit-label-dash-button")
      .classed("active-circle", true)
      .attr("stroke-opacity", "0.8")
      .selectAll("circle")
      .data(this.gCirclePulse.pulseData)
      .enter()
      .insert("circle", ".habit-label-dash-button")
      .attr("r", function (d) {
        return d;
      })
      .attr("fill", "none")
      .style("stroke-width", "4")
      .style("stroke", this.gCirclePulse.pulseScale);
  }

  activateNodeAnimation = debounce(() => {
    // https://stackoverflow.com/questions/45349849/concentric-emanating-circles-d3
    // Credit: Andrew Reid

    // _p("animated node", this.activeNode, "!");
    this.zoomBase().selectAll(".active-circle").remove();
    this.setNodeAnimationGroups();

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
      this.activateNodeAnimation();
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
