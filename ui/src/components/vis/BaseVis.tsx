import { select, Selection } from "d3-selection";
import { zoom, ZoomBehavior } from "d3-zoom";
import { linkVertical, linkHorizontal } from "d3-shape";
import { HierarchyLink, HierarchyNode, tree } from "d3-hierarchy";
import { easeCubic, easeLinear } from "d3-ease";
import { TreeLayout } from "d3-hierarchy";
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

import { noNodeCol, parentPositiveBorderCol, positiveColLighter, BASE_SCALE, FOCUS_MODE_SCALE, LG_LEVELS_HIGH, LG_LEVELS_WIDE, LG_NODE_RADIUS, XS_LEVELS_HIGH, XS_LEVELS_WIDE, XS_NODE_RADIUS } from "./constants";
import { EventHandlers, IVisualization, Margins, ViewConfig, VisType, ZoomConfig } from "./types";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { GetOrbitsDocument, Orbit } from "../../graphql/generated";
import { client } from "../../graphql/client";
import { OrbitNodeDetails, store, SphereOrbitNodes, mapToCacheObject, nodeCache } from "../../state/jotaiKeyValueStore";
import { extractEdges } from "../../graphql/utils";

/**
 * Base class for creating D3 hierarchical visualizations.
 * This class handles the setup and rendering of the visualization.
 * Extend this class to implement specific types of visualizations.
 */
export abstract class BaseVisualization implements IVisualization {
  type: VisType;
  rootData: HierarchyNode<any>;
  nodeDetails: SphereOrbitNodes;
  _nextRootData: HierarchyNode<any> | null;

  _svgId: string;
  _canvas: Selection<SVGGElement, unknown, HTMLElement, any> | undefined;
  _viewConfig: ViewConfig;
  _zoomConfig: ZoomConfig;

  // Current Vis sphere context:
  sphereEh: EntryHashB64;
  sphereAh: ActionHashB64;
  // State handlers passed from parent React component:
  modalParentOrbitEh!:  React.Dispatch<React.SetStateAction<EntryHashB64 | undefined>>;
  modalChildOrbitEh!:  React.Dispatch<React.SetStateAction<EntryHashB64 | undefined>>;
  globalStateTransition: Function;

  eventHandlers: EventHandlers;
  zoomer: ZoomBehavior<Element, unknown>;

  _gLink?: typeof this._canvas;
  _gNode?: typeof this._canvas;
  _gCircle?: Selection<SVGGElement, HierarchyNode<any>, SVGGElement, unknown>;
  _gTooltip?: Selection<SVGForeignObjectElement, HierarchyNode<any>, SVGGElement, unknown>;
  _gButton?: Selection<SVGForeignObjectElement, HierarchyNode<any>, SVGGElement, unknown>;
  _enteringLinks?: Selection<SVGPathElement, HierarchyLink<any>, SVGGElement, unknown>;  
  _enteringNodes?: Selection<SVGGElement, HierarchyNode<any>, SVGGElement, unknown>;  

  // Methods for procedures at different parts of the vis render:

  abstract setNodeAndLinkEnterSelections(): void;
  abstract appendNodesAndLabels(): void;
  abstract appendNodeDetailsAndControls(): void;
  abstract setNodeAndLabelGroups(): void;
  abstract appendLinkPath(): void;
  abstract bindEventHandlers(selection: any): void;
  abstract getLinkPathGenerator(): void;

  abstract initializeViewConfig(canvasHeight: number, canvasWidth: number, margin: Margins): ViewConfig;
  abstract initializeZoomConfig(): ZoomConfig;
  abstract initializeEventHandlers(): EventHandlers;
  abstract initializeZoomer(): ZoomBehavior<Element, unknown>;

  isModalOpen: boolean = false;
  skipMainRender: boolean = false;
  activeNode: any = null;
  isNewActiveNode: boolean = false;
  _hasRendered: boolean = false;


  /**
   * Constructor for the BaseVisualization class.
   * @param type - The type of visualization.
   * @param svgId - The ID of the SVG element.
   * @param inputTree - The input data for the tree.
   * @param canvasHeight - The height of the canvas.
   * @param canvasWidth - The width of the canvas.
   * @param margin - The margins for the canvas.
   * @param globalStateTransition - Function to handle global state transitions.
   * @param sphereEh - Entry hash for the sphere.
   * @param sphereAh - Action hash for the sphere.
   * @param nodeDetails - Details of the nodes in the sphere (from the cache).
   */
  constructor(
    type: VisType,
    svgId: string,
    inputTree: HierarchyNode<any>,
    canvasHeight: number,
    canvasWidth: number,
    margin: Margins,
    globalStateTransition: (newState: string, params: object) => void,
    sphereEh: EntryHashB64,
    sphereAh: ActionHashB64,
    nodeDetails: SphereOrbitNodes
  ) {
    this.type = type;
    this._svgId = svgId;
    this.rootData = inputTree;
    this.globalStateTransition = globalStateTransition;
    this.sphereEh = sphereEh;
    this.sphereAh = sphereAh;
    this.nodeDetails = nodeDetails;
    this._nextRootData = null;

    this._viewConfig = this.initializeViewConfig(canvasHeight, canvasWidth, margin);
    this._zoomConfig = this.initializeZoomConfig();
    this.eventHandlers = this.initializeEventHandlers();

    this.zoomer = this.initializeZoomer();
  }

  /**
   * Set up the canvas for rendering.
   */
  setupCanvas(): void {
    if (this.noCanvas()) {
      this._canvas = select(`#${this._svgId}`)
        .append("g")
        .classed("canvas", true);
    }
  }

  /**
   * Set up the layout for the visualization.
   */
  abstract setupLayout(): void;

  /**
   * Set up node and link groups.
   */
  setNodeAndLinkGroups(): void {
    !this.firstRender() && this.clearNodesAndLinks();

    this._gLink = this._canvas!
      .append("g")
      .classed("links", true);
      // .attr("transform", transformation);
    this._gNode = this._canvas!
      .append("g")
      .classed("nodes", true);
      // .attr("transform", transformation);
  }

  /**
   * Render the visualization.
   */
  public render(): void {
    if (this.noCanvas()) {
      this.setupCanvas();
    }

    if (this.firstRender() || this.hasNextData()) {
      this.clearCanvas();

      if (this.hasNextData()) {
        this.rootData = this._nextRootData!;
        this._nextRootData = null;
      }

      this.setupLayout();
      this.setNodeAndLinkGroups();
      this.setNodeAndLinkEnterSelections();
      this.appendNodesAndLabels();

      this.applyInitialTransform();

      this._hasRendered = true;
    }
  }

  // Utility methods:
  /**
     * Checks if the canvas element exists in the DOM.
     * @returns {boolean} True if the canvas doesn't exist or is empty, false otherwise.
     */
  noCanvas(): boolean {
    return (
      typeof this._canvas === "undefined" ||
      (select(`#${this._svgId} .canvas`) as any)._groups.length === 0
    );
  }

  /** Clear just nodes and links from the canvas **/
  clearNodesAndLinks(): void {
    this._canvas!.selectAll('g.nodes').remove();
    this._canvas!.selectAll('g.links').remove();
  }

  /** Clear labels and re-append  **/
  clearAndRedrawLabels(): Selection<SVGForeignObjectElement, HierarchyNode<any>, SVGGElement, unknown> {
    !this.firstRender() && this._canvas!.selectAll(".tooltip").remove();

    return this._enteringNodes!
      .append("g")
      .classed("tooltip", true)
      .append("foreignObject")
      .attr("transform", () => {
        return `scale(${this._viewConfig.isSmallScreen() ? 0.5 : 1})`
      })
      .attr("x", "-375")
      .attr("y", "-10")
      .attr("width", "650")
      .style("overflow", "visible")
      .attr("height", "650")
      .html((d): string => {
        if (!d?.data?.content || !this.nodeDetails[d.data.content]) return ""
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

  /**
   * Determines if this is the first render of the visualization.
   * @returns {boolean} True if this is the first render, false otherwise.
   */
  firstRender(): boolean {
    return !this._hasRendered;
  }

  /**
   * Checks if there is new data to be rendered.
   * @returns {boolean} True if there is new data (_nextRootData is not null), false otherwise.
   */
  hasNextData(): boolean {
    return this._nextRootData !== null;
  }

  /**
   * Clears all child elements from the canvas.
   * This is typically called before re-rendering the visualization with new data.
   */
  clearCanvas(): void {
    select(".canvas").selectAll("*").remove();
  }

  /**
   * Applies the initial transform to the visualization.
   * This method should be implemented by subclasses to set up the initial view of the visualization.
   */
  abstract applyInitialTransform(): void;

}