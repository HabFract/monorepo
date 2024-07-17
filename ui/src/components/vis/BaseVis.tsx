// @ts-nocheck

import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { linkVertical, linkHorizontal } from "d3-shape";
import { tree } from "d3-hierarchy";
import { easeCubic, easeLinear } from "d3-ease";
import { TreeLayout } from "d3-hierarchy";
// import propagating from "propagating-hammerjs";
import _ from "lodash";

import astroIncomplete from "/assets/astro-incomplete.svg?raw";
import subAstroIncomplete from "/assets/sub-astro-incomplete.svg?raw";
import atomIncomplete from "/assets/atom-incomplete.svg?raw";

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

import { noNodeCol, parentPositiveBorderCol, positiveColLighter, BASE_SCALE, FOCUS_MODE_SCALE, LG_LEVELS_HIGH, LG_LEVELS_WIDE, LG_NODE_RADIUS, XS_LEVELS_HIGH, XS_LEVELS_WIDE, XS_NODE_RADIUS } from "./constants";
import { EventHandlers, IVisualization, Margins, ViewConfig, VisType, ZoomConfig } from "./types";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { GetOrbitsDocument, Orbit } from "../../graphql/generated";
import { client } from "../../graphql/client";
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
  modalChildOrbitEh?: Function;
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
      handlePrependNode: function ({ childOrbitEh }) {
        this.modalOpen(true);
        this.modalIsOpen = true;
        this.modalChildOrbitEh(childOrbitEh)
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
      this._viewConfig.canvasWidth / (this._viewConfig.levelsHigh as number * 2) - // Adjust for tree horizontal spacing on different screens
      +(this.type == VisType.Tree && this._viewConfig.isSmallScreen()) * 250 -
      +(this.type == VisType.Cluster && this._viewConfig.isSmallScreen()) * 210;
    this._viewConfig.dy =
      this._viewConfig.canvasHeight / (this._viewConfig.levelsWide as number * 2);
    //adjust for taller aspect ratio
    this._viewConfig.dx *= this._viewConfig.isSmallScreen() ? 4.25 : 2;
    this._viewConfig.dy *= this._viewConfig.isSmallScreen() ? 3.25 : 2;
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

    this.zoomer = zoom().scaleExtent([0.1, 1.5]).on("zoom", zooms.bind(this));
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
          );
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
      .attr("stroke-opacity", (d) => {
          const parent = d.source?.data?.content;
          const child = d.target?.data?.content;
          if (!parent || !this.nodeDetails[parent] || !child || !this.nodeDetails[child]) return
          const cachedNodeParent = Object.values(this.nodeDetails).find(n => n.eH == parent);
          const cachedNodeChild = Object.values(this.nodeDetails).find(n => n.eH == child);
          if(cachedNodeChild?.checked && cachedNodeParent?.checked) return 1;
          return 0.5
        }
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
      .attr("x", "-375")
      .attr("y", "-10")
      .attr("width", "650")
      .style("overflow", "visible")
      .attr("height", "650")
      .html((d) => {
        if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const cachedNode = this.nodeDetails[d.data.content];
        const { name, description, scale } = cachedNode;
        return `<div class="tooltip-inner">
          <div class="content">
          <span class="title">Name:</span>
          <p>${name}</p>
          <span class="title">Description:</span>
          <p>${description || "<br />"}</p>
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
      });
    this._gTooltip = this.clearAndRedrawLabels()
  }

  appendCirclesAndLabels(): void {
    this._gCircle
      .html((d) => {
        if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
        const { scale } = this.nodeDetails[d.data.content];
        switch (scale) {
          case 'Atom': return atomIncomplete;
          case 'Astro': return astroIncomplete;
          case 'Sub': return subAstroIncomplete;
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
        const { checked, scale, parentEh } = this.nodeDetails[d.data.content];
        return `<div class="buttons">
          <button class="tooltip-action-button higher-button ${!parentEh && scale !== 'Astro' ? 'hide' : 'hide'}"></button>
          <img data-button="true" class="tooltip-action-button checkbox-button" src="${checked ? "assets/checkbox-checked.svg" : "assets/checkbox-empty.svg"}" />
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
      console.log('refetched orbits :>> ', data);
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
        if (!["BUTTON", 'IMG'].includes(e.target.tagName)) return;
        if(e.target.tagName == "IMG" && !e.target.dataset.button) return;

        this.eventHandlers.handleNodeFocus.call(this, e, d);
        switch (true) {
          case e.target.classList.contains('checkbox-button'):
            if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.nodeDetails[d.data.content].checked = !(this.nodeDetails[d.data.content].checked);
            e.target.classList.toggle('checked');
            e.target.closest('.the-node').firstChild.classList.toggle('checked');

            this._enteringLinks
              .attr("stroke-opacity", (d) => {
                const parent = d.source?.data?.content;
                const child = d.target?.data?.content;
                if (!parent || !this.nodeDetails[parent] || !child || !this.nodeDetails[child]) return
                const cachedNodeParent = Object.values(this.nodeDetails).find(n => n.eH == parent);
                const cachedNodeChild = Object.values(this.nodeDetails).find(n => n.eH == child);
                if(cachedNodeChild?.checked && cachedNodeParent?.checked) return 1;
                return 0.35
            }
          )
            this.render();
            break;

          case e.target.classList.contains('higher-button'): // Prepend
            if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.eventHandlers.handlePrependNode.call(this, { childOrbitEh: this.nodeDetails[d.data.content].eH as string })
            break;

          case e.target.classList.contains('lower-button'): // Append
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
      // this.appendLinkPath();

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
