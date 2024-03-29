// @ts-nocheck

import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { linkVertical, linkHorizontal } from "d3-shape";
import { tree } from "d3-hierarchy";
import { easeCubic, easeLinear } from "d3-ease";
import { TreeLayout } from "d3-hierarchy";
// import propagating from "propagating-hammerjs";
import _ from "lodash";

import {
  ONE_CHILD,
  ONE_CHILD_XS,
  TWO_CHILDREN_LEFT,
  TWO_CHILDREN_RIGHT,
  THREE_CHILDREN_LEFT,
  THREE_CHILDREN_RIGHT,
  FOUR_CHILDREN_LEFT_1,
  FOUR_CHILDREN_LEFT_2,
  FOUR_CHILDREN_RIGHT_1,
  FOUR_CHILDREN_RIGHT_2,
  FIVE_CHILDREN_LEFT_1,
  FIVE_CHILDREN_LEFT_2,
  FIVE_CHILDREN_RIGHT_1,
  FIVE_CHILDREN_RIGHT_2,
  SIX_CHILDREN_LEFT_1,
  SIX_CHILDREN_LEFT_2,
  SIX_CHILDREN_LEFT_3,
  SIX_CHILDREN_RIGHT_1,
  SIX_CHILDREN_RIGHT_2,
  SIX_CHILDREN_RIGHT_3,

  TWO_CHILDREN_RIGHT_XS,
  TWO_CHILDREN_LEFT_XS,
  THREE_CHILDREN_LEFT_XS,
  THREE_CHILDREN_RIGHT_XS,
  FOUR_CHILDREN_LEFT_1_XS,
  FOUR_CHILDREN_LEFT_2_XS,
  FOUR_CHILDREN_RIGHT_1_XS,
  FOUR_CHILDREN_RIGHT_2_XS,
  FIVE_CHILDREN_LEFT_1_XS,
  FIVE_CHILDREN_LEFT_2_XS,
  FIVE_CHILDREN_RIGHT_1_XS,
  FIVE_CHILDREN_RIGHT_2_XS,
  SIX_CHILDREN_LEFT_1_XS,
  SIX_CHILDREN_LEFT_2_XS,
  SIX_CHILDREN_LEFT_3_XS,
  SIX_CHILDREN_RIGHT_1_XS,
  SIX_CHILDREN_RIGHT_2_XS,
  SIX_CHILDREN_RIGHT_3_XS
} from './PathTemplates/paths';

import { expand, collapse, contentEqual, nodeStatusColours, parseTreeValues, cumulativeValue, outOfBoundsNode, getInitialXTranslate, getInitialYTranslate, newXTranslate, newYTranslate, debounce } from "./helpers";

import { noNodeCol, parentPositiveBorderCol, positiveColLighter, BASE_SCALE, FOCUS_MODE_SCALE, LG_BUTTON_SCALE, LG_LABEL_SCALE, LG_LEVELS_HIGH, LG_LEVELS_WIDE, LG_NODE_RADIUS, XS_BUTTON_SCALE, XS_LABEL_SCALE, XS_LEVELS_HIGH, XS_LEVELS_WIDE, XS_NODE_RADIUS, } from "./constants";
import { EventHandlers, IVisualization, Margins, ViewConfig, VisType, ZoomConfig } from "./types";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { GetOrbitsDocument, Orbit } from "../../graphql/generated";
import { client } from "../../main";
import { OrbitNodeDetails, store, SphereOrbitNodes, mapToCacheObject, nodeCache } from "../../state/jotaiKeyValueStore";
import { extractEdges } from "../../graphql/utils";

export default class BaseVisualization implements IVisualization {
  type: VisType;
  _svgId: string;
  _canvas: any;
  _manager: any;
  zoomer: any;
  rootData: any;
  nodeDetails: SphereOrbitNodes;
  sphereEh: EntryHashB64;
  sphereAh: ActionHashB64;
  globalStateTransition: Function;
  modalIsOpen?: boolean;
  modalParentOrbitEh?: Function;
  _nextRootData: any;
  layout!: TreeLayout<unknown>;
  _viewConfig: ViewConfig;
  _zoomConfig: ZoomConfig;
  eventHandlers: EventHandlers;
  _hasRendered: boolean = false;
  skipMainRender: boolean = false;
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

  constructor(type, svgId, inputTree, canvasHeight, canvasWidth, margin: Margins, globalStateTransition, sphereEh: EntryHashB64, sphereAh: ActionHashB64, nodeDetails: SphereOrbitNodes) {
    this.type = type;
    this._svgId = svgId;
    this.rootData = inputTree;
    this.nodeDetails = nodeDetails;
    this.sphereEh = sphereEh;
    this.sphereAh = sphereAh;
    this.modalIsOpen = false;
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
      handleAppendNode: function ({ parentOrbitEh }) {
        this.modalOpen(true);
        this.modalIsOpen = true;
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

  firstRender(): boolean {
    return !this._hasRendered;
  }

  noCanvas(): boolean {
    return (
      typeof this?._canvas == "undefined" ||
      (select(`#${this._svgId} .canvas`) as any)._groups.length == 0
    );
  }

  hasNextData(): boolean {
    return !!this?._nextRootData;
  }

  hasSummedData(): boolean {
    return !!this.rootData?.value;
  }

  hasNewHierarchyData(): boolean {
    return (
      this.hasNextData()// && hierarchyStateHasChanged(this._nextRootData, this)
    );
  }

  setActiveNode(clickedNodeContent, event: any = null) {
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

  setCurrentNode(node): void {
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

  setCurrentHabit(node): void {
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

  removeCanvas(): void {
    select(".canvas")?.remove();
  }

  clearCanvas(): void {
    select(".canvas").selectAll("*").remove();
  }

  // clearPreviousLinkPath() : void {
  //   this._canvas.selectAll("g.links *").remove();
  // }

  appendLinkPath(): void {
    const rootNodeId = this.rootData.data.content;
    const cacheItem: OrbitNodeDetails = store.get(nodeCache.items)?.[this.sphereAh]?.[rootNodeId];
    if (!cacheItem || !cacheItem?.path) return

    const newPath = select(".canvas").selectAll("g.links").append('path')
      .attr("d", cacheItem.path)
      .classed("link", true)
      .classed("appended-path", true)
      .attr("stroke-width", "3")
      .attr("stroke-opacity", "0.3")
      .attr("data-testid", getTestId(cacheItem.path));

    const pathElement = newPath._groups[0][0];
    const { height, width } = pathElement.getBoundingClientRect();
    select(pathElement).attr("transform", `translate(${getPathXTranslation(cacheItem.path, width, (this._viewConfig.isSmallScreen() ? 30 : 250) / this._viewConfig.scale) * this._viewConfig.scale},${-((height + (this._viewConfig.isSmallScreen() ? 0 : 100)) * this._viewConfig.scale)})`);

    // Helper function to get exact x translation based on path
    function getPathXTranslation(path: string, width: number, offset: number): number {
      switch (path) {
        case ONE_CHILD:
          return 0
        case ONE_CHILD_XS:
          return 0
        case TWO_CHILDREN_LEFT:
          return width + offset
        case TWO_CHILDREN_RIGHT:
          return -(width + offset)
        case TWO_CHILDREN_LEFT_XS:
          return width + offset
        case TWO_CHILDREN_RIGHT_XS:
          return -(width + offset)
        case THREE_CHILDREN_LEFT:
          return width + offset * 2
        case THREE_CHILDREN_RIGHT:
          return -(width + offset * 2)
        case THREE_CHILDREN_LEFT_XS:
          return width + offset * 2
        case THREE_CHILDREN_RIGHT_XS:
          return -(width + offset * 2)
        case FOUR_CHILDREN_LEFT_1:
          return width + offset * 3
        case FOUR_CHILDREN_LEFT_2:
          return width + offset
        case FOUR_CHILDREN_RIGHT_1:
          return -(width + offset)
        case FOUR_CHILDREN_RIGHT_2:
          return -(width + offset * 3)
        case FOUR_CHILDREN_LEFT_1_XS:
          return width + offset * 3
        case FOUR_CHILDREN_LEFT_2_XS:
          return width + offset
        case FOUR_CHILDREN_RIGHT_1_XS:
          return -(width + offset)
        case FOUR_CHILDREN_RIGHT_2_XS:
          return -(width + offset * 3)
        case FIVE_CHILDREN_LEFT_1:
          return width + offset * 4
        case FIVE_CHILDREN_LEFT_2:
          return width + offset * 2
        case FIVE_CHILDREN_RIGHT_1:
          return -(width + offset * 2)
        case FIVE_CHILDREN_RIGHT_2:
          return -(width + offset * 4)
        case FIVE_CHILDREN_LEFT_1_XS:
          return width + offset * 4
        case FIVE_CHILDREN_LEFT_2_XS:
          return width + offset * 2
        case FIVE_CHILDREN_RIGHT_1_XS:
          return -(width + offset * 2)
        case FIVE_CHILDREN_RIGHT_2_XS:
          return -(width + offset * 4)
        case SIX_CHILDREN_LEFT_1:
          return width + offset * 5
        case SIX_CHILDREN_LEFT_2:
          return width + offset * 2
        case SIX_CHILDREN_LEFT_3:
          return width + offset * 2
        case SIX_CHILDREN_RIGHT_1:
          return -(width + offset * 2)
        case SIX_CHILDREN_RIGHT_2:
          return -(width + offset * 2)
        case SIX_CHILDREN_RIGHT_3:
          return -(width + offset * 5)
        case SIX_CHILDREN_LEFT_1_XS:
          return width + offset * 5
        case SIX_CHILDREN_LEFT_2_XS:
          return width + offset * 2
        case SIX_CHILDREN_LEFT_3_XS:
          return width + offset * 2
        case SIX_CHILDREN_RIGHT_1_XS:
          return -(width + offset * 2)
        case SIX_CHILDREN_RIGHT_2_XS:
          return -(width + offset * 2)
        case SIX_CHILDREN_RIGHT_3_XS:
          return -(width + offset * 5)
        default:
          0
      }
    }
    // Helper function to fetch path testId based on path
    function getTestId(path: string): string {
      switch (path) {
        case ONE_CHILD:
          return 'path-parent-one-child'
        case ONE_CHILD_XS:
          return 'path-parent-one-child'
        case TWO_CHILDREN_LEFT_XS:
          return 'path-parent-two-children-0'
        case TWO_CHILDREN_RIGHT_XS:
          return 'path-parent-two-children-1'
        case THREE_CHILDREN_LEFT_XS:
          return 'path-parent-three-children-0'
        case THREE_CHILDREN_RIGHT_XS:
          return 'path-parent-three-children-2'
        default:
          'none'
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

  setLevelsHighAndWide(): void {
    if (this._viewConfig.isSmallScreen()) {
      this._viewConfig.levelsHigh = XS_LEVELS_HIGH;
      this._viewConfig.levelsWide = XS_LEVELS_WIDE;
    } else {
      this._viewConfig.levelsHigh = LG_LEVELS_HIGH;
      this._viewConfig.levelsWide = LG_LEVELS_WIDE;
    }
  }

  setdXdY(): void {
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

  setNodeRadius(): void {
    this._viewConfig.nodeRadius =
      (this._viewConfig.isSmallScreen() ? XS_NODE_RADIUS : LG_NODE_RADIUS) * BASE_SCALE;
  }

  setZoomBehaviour(): void {
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

  calibrateViewPortAttrs(): void {
    this._viewConfig.viewportW =
      this._viewConfig.canvasWidth * (this._viewConfig.levelsWide as number);
    this._viewConfig.viewportH =
      this._viewConfig.canvasHeight * (this._viewConfig.levelsHigh as number);

    this._viewConfig.viewportX = 0;
    this._viewConfig.viewportY = 0;

    this._viewConfig.defaultView = `${this._viewConfig.viewportX} ${this._viewConfig.viewportY} ${this._viewConfig.viewportW} ${this._viewConfig.viewportH}`;
  }

  calibrateViewBox(): void {
    this.zoomBase()
      .attr("viewBox", this._viewConfig.defaultView)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .on("dblclick.zoom", null);
  }

  static sumHierarchyData(data): void {
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

  static accumulateNodeValues(node): void {
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

  activeOrNonActiveOpacity(d, dimmedOpacity: string): string {
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

  getLinkPathGenerator(): void {
    switch (this.type) {
      case VisType.Tree:
        //@ts-ignore
        return linkVertical()
          .x((d: any) => d.x)
          .y((d: any) => d.y);
      case VisType.Cluster:
        //@ts-ignore
        return linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x);
      // case "radial":
      //   return linkRadial()
      //     .angle((d) => d.x / 8)
      //     .radius((d) => d.y);
    }
  }

  setLayout(): void {
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

  setNodeAndLinkGroups(): void {
    !this.firstRender() && this.clearNodesAndLinks();

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

  setNodeAndLinkEnterSelections(): void {
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
          return `rotate(${((d.x / 8) * 180) / Math.PI - 90}) translate(${d.y
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

  clearNodesAndLinks(): void {
    this._canvas.selectAll('g.nodes').remove();
    this._canvas.selectAll('g.links').remove();
  }

  clearAndRedrawLabels(): void {
    !this.firstRender() && this._canvas.selectAll(".tooltip").remove();

    return this._enteringNodes
      .append("g")
      .classed("tooltip", true)
      .append("foreignObject")
      .attr("x", "-295")
      .attr("y", "-45")
      .attr("width", "550")
      .style("overflow", "visible")
      .attr("height", "550")
      .html((d) => {
        if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const cachedNode = this.nodeDetails[d.data.content];
        const { name, description, scale } = cachedNode;
        return `<div class="tooltip-inner">
          <div class="content">
          <span class="title">Name:</span>
          <p>${name}</p>
          <span class="title">Description:</span>
          <p>${description} - ${scale}</p>
          </div>
        </div>`
      });
  }

  setCircleAndLabelGroups(): void {
    this._gCircle = this._enteringNodes
      .append("g")
      .classed("node-subgroup", true)
      .attr("stroke-width", "0")
      .classed("checked", (d) => {
        if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const { checked } = this.nodeDetails[d.data.content];
        return checked
      })
      .attr("style", (d) => {
        if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const { scale } = this.nodeDetails[d.data.content];
        // return scale == 'Astro' ? "filter: saturate(0.45)" : "filter: brightness(1.25)"

      });
    this._gTooltip = this.clearAndRedrawLabels()
  }

  appendCirclesAndLabels(): void {
    this._gCircle
      .html((d) => {
        if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const { scale } = this.nodeDetails[d.data.content];
        switch (scale) {
          case 'Astro':
            return `
            <defs
          id="defs1379">
          <mask
            id="mask2_849_2598"
            maskUnits="userSpaceOnUse"
            x="43"
            y="4"
            width="19"
            height="19">
            <circle
              cx="52.650398"
              cy="13.3153"
              r="8.75"
              transform="rotate(-6,52.6504,13.3153)"
              fill="#d2e1fb"
              id="circle1283" />
          </mask>
          <mask
            id="mask3_849_2598"
            maskUnits="userSpaceOnUse"
            x="43"
            y="4"
            width="19"
            height="19">
            <circle
              cx="52.650398"
              cy="13.3153"
              r="8.75"
              transform="rotate(-6,52.6504,13.3153)"
              fill="#89bff2"
              id="circle1290" />
          </mask>
          <mask
            id="mask4_849_2598"
            maskUnits="userSpaceOnUse"
            x="42"
            y="3"
            width="21"
            height="21">
            <circle
              cx="52.649799"
              cy="13.3154"
              r="9.25"
              transform="rotate(-6,52.6498,13.3154)"
              fill="#89bff2"
              stroke="#332d57"
              id="circle1305" />
          </mask>
        </defs>
        <g
          inkscape:label="Layer 1"
          inkscape:groupmode="layer"
          id="layer1"
          transform="translate(-0.41635753,-1.3582969)">
          <g
            style="mix-blend-mode:luminosity"
            id="g1326"
            transform="matrix(0.26458333,0,0,0.26458333,-9.97291,1.1334027)">
            <circle
              cx="52.650398"
              cy="13.3153"
              r="11.25"
              transform="rotate(-6,52.6504,13.3153)"
              fill="#ffffff"
              fill-opacity="0.3"
              id="circle1279"
              style="fill:#919392;fill-opacity:0.752021;stroke:#919392;stroke-opacity:1" />
            <circle
              cx="52.649799"
              cy="13.3154"
              r="9.25"
              transform="rotate(-6,52.6498,13.3154)"
              fill="#89bff2"
              stroke="#332d57"
              id="circle1281"
              style="fill:#92a8d4;fill-opacity:1;stroke:#37383a;stroke-opacity:1" />
            <mask
              id="mask1317"
              maskUnits="userSpaceOnUse"
              x="43"
              y="4"
              width="19"
              height="19">
              <circle
                cx="52.650398"
                cy="13.3153"
                r="8.75"
                transform="rotate(-6,52.6504,13.3153)"
                fill="#d2e1fb"
                id="circle1315" />
            </mask>
            <g
              mask="url(#mask2_849_2598)"
              id="g1288">
              <circle
                cx="50.661098"
                cy="13.5244"
                r="8.75"
                transform="rotate(-6,50.6611,13.5244)"
                fill="#d2e1fb"
                id="circle1286"
                style="fill:#c0c7ce;fill-opacity:1" />
            </g>
            <mask
              id="mask1323"
              maskUnits="userSpaceOnUse"
              x="43"
              y="4"
              width="19"
              height="19">
              <circle
                cx="52.650398"
                cy="13.3153"
                r="8.75"
                transform="rotate(-6,52.6504,13.3153)"
                fill="#89bff2"
                id="circle1321" />
            </mask>
            <g
              mask="url(#mask3_849_2598)"
              id="g1297">
              <circle
                cx="54.313499"
                cy="5.2221498"
                r="1.125"
                transform="rotate(-96,54.3135,5.22215)"
                fill="#c5e0ef"
                stroke="#332d57"
                stroke-width="0.75"
                id="circle1293"
                style="stroke:#37383a;stroke-opacity:1" />
            </g>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M 49.047,7.28995 C 49.0083,6.922 48.6077,6.71436 48.303,6.92431 c -1.55,1.06823 -2.6768,2.67961 -3.1334,4.52919 -0.0803,0.3256 0.196,0.6167 0.5296,0.5817 0.2225,-0.0234 0.402,-0.1896 0.4578,-0.4063 0.4019,-1.5617 1.3536,-2.92375 2.6569,-3.84156 0.1607,-0.11314 0.2536,-0.30196 0.2331,-0.49739 z"
              fill="#ffffff"
              id="path1299" />
            <circle
              cx="45.269699"
              cy="13.2112"
              r="0.5"
              transform="rotate(-6,45.2697,13.2112)"
              fill="#ffffff"
              id="circle1301" />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="m 43.8077,12.379 c 0.0997,-0.0771 0.1648,-0.1897 0.1828,-0.3145 0.0616,-0.4268 -0.4181,-0.766 -0.76,-0.5032 -2.2587,1.7362 -3.4429,3.6621 -2.9749,5.2941 0.8697,3.0329 7.1157,3.9028 13.9509,1.9428 6.8352,-1.96 11.6713,-6.0075 10.8016,-9.04045 C 64.8209,9.10498 64.3847,8.55242 63.7472,8.1067 63.5123,7.9425 63.1943,8.04433 63.0676,8.30137 l -0.1798,0.36467 c -0.017,0.03454 -0.0041,0.0763 0.0291,0.09577 0.6608,0.3872 1.0023,0.82666 1.1299,1.27159 0.1276,0.4449 0.0708,0.9986 -0.2843,1.6771 -0.3584,0.6847 -0.9943,1.4385 -1.9077,2.203 -1.8245,1.5271 -4.6084,2.9727 -7.9239,3.9234 -3.3155,0.9507 -6.4424,1.2 -8.799,0.8718 -1.1796,-0.1643 -2.1183,-0.4666 -2.7852,-0.8574 -0.6607,-0.3872 -1.0023,-0.8266 -1.1298,-1.2715 -0.1276,-0.4449 -0.0708,-0.9986 0.2843,-1.6771 0.3584,-0.6848 0.9943,-1.4386 1.9077,-2.203 0.1282,-0.1074 0.2612,-0.2143 0.3988,-0.3207 z M 62.1391,7.92321 C 62.0267,8.15124 61.7624,8.2584 61.5178,8.1891 61.102,8.07131 60.6392,7.97512 60.1318,7.90446 59.9788,7.88315 59.8225,7.86428 59.6632,7.84788 59.538,7.83498 59.4228,7.7731 59.3416,7.67682 59.0636,7.3469 59.2925,6.80577 59.7219,6.8487 c 0.7773,0.07772 1.493,0.21058 2.1317,0.39644 0.288,0.08379 0.4181,0.40909 0.2855,0.67807 z"
              fill="#332d57"
              id="path1303"
              style="fill:#37383a;fill-opacity:1;stroke:#bbc3cf;stroke-width:0;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
            <mask
              id="mask1332"
              maskUnits="userSpaceOnUse"
              x="42"
              y="3"
              width="21"
              height="21">
              <circle
                cx="52.649799"
                cy="13.3154"
                r="9.25"
                transform="rotate(-6,52.6498,13.3154)"
                fill="#89bff2"
                stroke="#332d57"
                id="circle1330" />
            </mask>
            <g
              mask="url(#mask4_849_2598)"
              id="g1312">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="m 54.1187,14.7402 c -0.0579,0.3655 0.285,0.666 0.6373,0.5528 5.1129,-1.6431 8.9484,-4.4388 9.8233,-6.9785 0.1347,-0.39076 -0.26,-0.69515 -0.6458,-0.54703 -0.1643,0.06303 -0.287,0.20009 -0.3523,0.36341 -0.0445,0.11124 -0.0976,0.22623 -0.1598,0.34504 -0.3584,0.68475 -0.9943,1.43855 -1.9076,2.20298 -1.6612,1.3904 -4.1176,2.7132 -7.0465,3.6565 -0.183,0.0589 -0.3185,0.2149 -0.3486,0.4048 z m -10.9795,1.2436 c 0.0176,-0.1108 -0.0932,-0.1984 -0.198,-0.1582 -0.1286,0.0494 -0.1286,0.2302 0.0032,0.2706 0.0037,0.0012 0.0075,0.0023 0.0113,0.0035 0.0837,0.0255 0.1699,-0.0295 0.1835,-0.1159 z"
                fill="#332d57"
                id="path1308"
                style="fill:#37383a;fill-opacity:1" />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="m 57.3487,18.8459 c -0.0625,0.3949 0.3344,0.7018 0.6957,0.5305 3.407,-1.615 5.8291,-3.7185 6.5019,-5.6708 0.1346,-0.3908 -0.26,-0.6955 -0.6458,-0.5473 -0.1642,0.063 -0.287,0.2 -0.3523,0.3634 -0.0445,0.1112 -0.0976,0.2262 -0.1597,0.345 -0.3584,0.6848 -0.9943,1.4386 -1.9077,2.203 -1.011,0.8462 -2.3165,1.6673 -3.8439,2.3932 -0.1531,0.0727 -0.2616,0.2155 -0.2882,0.383 z m -11.21,2.6996 c 0.0467,-0.2952 -0.1752,-0.5641 -0.4733,-0.5856 -0.3135,-0.0227 -0.6164,-0.0545 -0.9075,-0.095 -0.168,-0.0234 -0.331,-0.0496 -0.4892,-0.0784 -0.1052,-0.0192 -0.2137,-0.0103 -0.3136,0.0281 -0.4905,0.1882 -0.4682,0.8415 0.0479,0.9396 0.5069,0.0963 1.0494,0.165 1.6219,0.2053 0.2528,0.0178 0.4741,-0.1637 0.5138,-0.414 z"
                fill="#332d57"
                id="path1310"
                style="fill:#37383a;fill-opacity:1" />
            </g>
            <circle
              transform="rotate(-96)"
              stroke="#332d57"
              stroke-width="0.75"
              id="circle1295"
              style="fill:#e83962;fill-opacity:0.771938;stroke:#37383a;stroke-opacity:1"
              r="1.25"
              cy="53.354523"
              cx="-27.567991" />
            <circle
              cx="58.828602"
              cy="2.7365699"
              r="1.25"
              transform="rotate(-6,58.8286,2.73657)"
              fill="#f7931b"
              stroke="#332d57"
              id="circle1314"
              style="fill:#e83962;fill-opacity:0.807848;stroke:#37383a;stroke-opacity:1" />
            <circle
              cx="52.9963"
              cy="15.4156"
              r="0.5"
              transform="rotate(-96,52.9963,15.4156)"
              fill="#332d57"
              id="circle1318"
              style="fill:#37383a;fill-opacity:1" />
            <circle
              cx="47.107601"
              cy="16.7887"
              r="0.875"
              transform="rotate(-96,47.1076,16.7887)"
              fill="#d2e1fb"
              stroke="#332d57"
              stroke-width="0.75"
              id="circle1320"
              style="stroke:#37383a;stroke-opacity:1" />
            <circle
              cx="49.778099"
              cy="11.1033"
              r="1.625"
              transform="rotate(-6,49.7781,11.1033)"
              fill="#86b7e5"
              id="circle1322"
              style="fill:#92a8d4;fill-opacity:1" />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="m 51.1458,10.9595 c 0.0794,0.7553 -0.4685,1.4319 -1.2237,1.5112 -0.7553,0.0794 -1.4318,-0.4685 -1.5112,-1.2237 -0.0794,-0.7552 0.4685,-1.43182 1.2237,-1.5112 0.3015,-0.03168 0.5905,0.03659 0.8339,0.17811 0.1303,0.07577 0.287,0.10729 0.4277,0.05328 C 51.1583,9.86658 51.2423,9.53775 51.014,9.37443 50.6062,9.08272 50.0941,8.93338 49.5562,8.98991 48.3891,9.11259 47.5423,10.1582 47.665,11.3254 c 0.1227,1.1672 1.1683,2.0139 2.3355,1.8912 1.1672,-0.1226 2.0139,-1.1683 1.8912,-2.3355 -0.0202,-0.1925 -0.2237,-0.294 -0.4044,-0.2246 l -0.2151,0.0826 c -0.0879,0.0337 -0.1362,0.1268 -0.1264,0.2204 z"
              fill="#332d57"
              id="path1324"
              style="fill:#37383a;fill-opacity:1" />
          </g>
        </g>`

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

  appendNodeDetailsAndControls() {
    this._gButton = this._gTooltip.select(".tooltip-inner")
      .append("g")
      .classed("tooltip-actions", true)
      .append("foreignObject")
      .attr("width", "550")
      .style("overflow", "visible")
      .attr("height", "550")
      .html((d) => {
        if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const { checked, scale } = this.nodeDetails[d.data.content];
        return `<div class="buttons">
          <button class="tooltip-action-button higher-button ${scale !== 'Astro' ? '' : 'hide'}"></button>
          <button class="tooltip-action-button checkbox-button ${checked ? 'checked' : ''}"></button>
          <button class="tooltip-action-button lower-button"></button>
        </div>`
      });
  }

  async refetchOrbits() {
    const variables = { sphereEntryHashB64: this.sphereEh };
    let data;
    try {
      const gql = await client;
      data = await gql.query({ query: GetOrbitsDocument, variables, fetchPolicy: 'network-only' })
      if (data?.data?.orbits) {
        const orbits = (extractEdges(data.data.orbits) as Orbit[]);
        const indexedOrbitData: Array<[ActionHashB64, OrbitNodeDetails]> = Object.entries(orbits.map(mapToCacheObject))
          .map(([_idx, value]) => [value.id, value]);
        this.cacheOrbits(indexedOrbitData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async cacheOrbits(orbitEntries: Array<[ActionHashB64, OrbitNodeDetails]>) {
    try {
      store.set(nodeCache.setMany, orbitEntries)
      this.nodeDetails = Object.entries(orbitEntries);
      console.log('Sphere orbits fetched and cached!')
    } catch (error) {
      console.error('error :>> ', error);
    }
  }

  bindEventHandlers(selection) {
    selection
      .on("contextmenu", this.eventHandlers.rgtClickOrDoubleTap)
      .on("click", (e, d) => {
        if (e.target.tagName !== "BUTTON") return;

        this.eventHandlers.handleNodeFocus.call(this, e, d);
        switch (true) {
          case e.target.classList.contains('checkbox-button'):
            if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.nodeDetails[d.data.content].checked = !this.nodeDetails[d.data.content];
            e.target.classList.toggle('checked');
            e.target.closest('.the-node').firstChild.classList.toggle('checked');
            this.refetchOrbits()
            this.render();
            break;

          case e.target.classList.contains('lower-button'):
            if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.eventHandlers.handleAppendNode.call(this, { parentOrbitEh: this.nodeDetails[d.data.content].eH as string })
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

  // bindMobileEventHandlers(selection) {
  //   this._manager = propagating(
  //     new Hammer.Manager(document.body, { domEvents: true })
  //   );
  //   // Create a recognizer
  //   const singleTap = new Hammer.Tap({ event: "singletap" });
  //   const doubleTap = new Hammer.Tap({
  //     event: "doubletap",
  //     taps: 2,
  //     interval: 800,
  //   });
  //   this._manager.add([doubleTap, singleTap]);
  //   doubleTap.recognizeWith(singleTap);
  //   singleTap.requireFailure(doubleTap);
  //   //----------------------
  //   // Mobile device events
  //   //----------------------
  //   selection.selectAll(".node-subgroup").on("touchstart", (e) => {
  //     this._manager.set({ inputTarget: e.target });
  //   });

  //   this._manager.on("doubletap", (ev) => {
  //     ev.srcEvent.preventDefault();
  //     ev.srcEvent.stopPropagation();
  //     // if (!isTouchDevice()) return;

  //     const target = ev.firstTarget;
  //     if (!target || target?.tagName !== "circle") return;

  //     ev.srcEvent.stopPropagation();

  //     let node = target?.__data__;
  //     if (typeof node == "number") {
  //       node = ev.target.parentNode?.__data__;
  //     }
  //     try {
  //       this.eventHandlers.rgtClickOrDoubleTap.call(this, ev.srcEvent, node);
  //     } catch (error) {
  //       console.log("Problem with mobile doubletap: ", error);
  //     }
  //   });

  //   this._manager.on("singletap", (ev) => {
  //     ev.srcEvent.preventDefault();
  //     if (
  //       // !isTouchDevice() ||
  //       ev.srcEvent.timeStamp === this.currentEventTimestamp || // Guard clause for callback firing twice
  //       select(`#${this._svgId}`).empty() // Guard clause for wrong vis element
  //     )
  //       return;
  //     this.currentEventTimestamp = ev.srcEvent.timeStamp;

  //     let target = ev.target;
  //     const node = target?.__data__;
  //     if (!target || !node) return;

  //     switch (ev?.target?.tagName) {
  //       // Delete button is currently the only path
  //       case "path":
  //         this.eventHandlers.handleDeleteNode.call(this, ev, node.data);
  //         break;
  //       //@ts-ignore
  //       case "rect":
  //         if (target.parentNode.classList.contains("tooltip")) return; // Stop label from triggering
  //       // Append or prepend are currently the only text
  //       case "text":
  //         const buttonTransitioning =
  //           select(target.parentNode).attr("style") === "opacity: 0";
  //         if (buttonTransitioning) return ev.srcEvent.stopPropagation();
  //         this.setCurrentHabit(node.data);

  //         // target.textContent == "DIVIDE"
  //         //   ? this.eventHandlers.handleAppendNode.call(this)
  //         //   : this.eventHandlers.handlePrependNode.call(this);
  //         break;
  //       default:
  //         let parentNodeGroup = _.find(this._enteringNodes._groups[0], (n) => {
  //           return n?.__data__?.data?.content == node?.data?.content;
  //         });
  //         target = parentNodeGroup;
  //         try {
  //           this.eventHandlers.handleMouseEnter.call(this, ev);
  //           this.eventHandlers.handleNodeFocus.call(this, ev.srcEvent, node);
  //           if (!this._gLink.attr("transform"))
  //             this.eventHandlers.handleNodeZoom.call(
  //               this,
  //               ev.srcEvent,
  //               node,
  //               false
  //             );
  //           break;
  //         } catch (error) {
  //           console.error(error);
  //         }
  //     }
  //   });
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
    if (this.skipMainRender) return this.skipMainRender = false;
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
      this.hasNewHierarchyData()
    ) {
      // First render OR New hierarchy needs to be rendered

      if (this.noCanvas()) return;
      this.clearCanvas();

      // Update the current day's rootData
      if (this.hasNextData()) {
        this.rootData = this._nextRootData;
        delete this._nextRootData
      }

      this.setLayout();

      this.setNodeAndLinkGroups();
      this.setNodeAndLinkEnterSelections();
      this.setCircleAndLabelGroups();

      this.appendNodeDetailsAndControls();
      this.appendLinkPath();

      this.appendCirclesAndLabels();

      this.eventHandlers.handleNodeZoom.call(this, null, this.activeNode);

      // this._viewConfig.isSmallScreen() &&
      //   this.bindMobileEventHandlers(this._enteringNodes);

      this._canvas.attr(
        "transform",
        `scale(${BASE_SCALE}), translate(${this._viewConfig.defaultCanvasTranslateX()}, ${this._viewConfig.defaultCanvasTranslateY()})`
      );

      console.log("BaseVis render complete... :>>");
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
