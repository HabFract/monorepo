import { select, Selection } from "d3-selection";
import { zoom, ZoomBehavior } from "d3-zoom";
import { HierarchyLink, HierarchyNode, tree } from "d3-hierarchy";
import { easeCubic, easeLinear } from "d3-ease";
import _ from "lodash";

import { noNodeCol, parentPositiveBorderCol, positiveColLighter, BASE_SCALE, FOCUS_MODE_SCALE, LG_LEVELS_HIGH, LG_LEVELS_WIDE, LG_NODE_RADIUS, XS_LEVELS_HIGH, XS_LEVELS_WIDE, XS_NODE_RADIUS } from "./constants";
import { EventHandlers, IVisualization, Margins, ViewConfig, VisType, ZoomConfig } from "./types";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { GetOrbitsDocument, Orbit } from "../../graphql/generated";
import { client } from "../../graphql/client";
import { OrbitNodeDetails, store, SphereOrbitNodes, mapToCacheObject, nodeCache } from "../../state/jotaiKeyValueStore";
import { extractEdges } from "../../graphql/utils";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";

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

  // Allow data to be re-cached after certain vis interactions:
  /**
   * Fetches Orbit data for a given Sphere.
   */
  async refetchOrbits() {
    const variables = { sphereEntryHashB64: this.sphereEh };
    let data;
    try {
      const gql: ApolloClient<NormalizedCacheObject> = await client as ApolloClient<NormalizedCacheObject>;
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

  /**
   * Caches Orbit data for a given Sphere.
   */
  async cacheOrbits(orbitEntries: Array<[ActionHashB64, OrbitNodeDetails]>) {
    try {
      store.set(nodeCache.setMany, orbitEntries)
      //@ts-ignore
      this.nodeDetails = Object.entries(orbitEntries);
      console.log('Sphere orbits fetched and cached!')
    } catch (error) {
      console.error('error :>> ', error);
    }
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
   * Applies the initial transform to the visualization.
   * This method should be implemented by subclasses to set up the initial view of the visualization.
   * TODO: implement
   */
  abstract applyInitialTransform(): void;

  /**
   * Set width/height view config variables from constants
   */
  setLevelsHighAndWide(): void {
    if (this._viewConfig.isSmallScreen()) {
      this._viewConfig.levelsHigh = XS_LEVELS_HIGH;
      this._viewConfig.levelsWide = XS_LEVELS_WIDE;
    } else {
      this._viewConfig.levelsHigh = LG_LEVELS_HIGH;
      this._viewConfig.levelsWide = LG_LEVELS_WIDE;
    }
  }

  /**
   * Set up SVG viewport attributes
   */
  calibrateViewPortAttrs(): void {
    this._viewConfig.viewportW =
      this._viewConfig.canvasWidth * (this._viewConfig.levelsWide as number);
    this._viewConfig.viewportH =
      this._viewConfig.canvasHeight * (this._viewConfig.levelsHigh as number);

    this._viewConfig.viewportX = 0;
    this._viewConfig.viewportY = 0;

    this._viewConfig.defaultView = `${this._viewConfig.viewportX} ${this._viewConfig.viewportY} ${this._viewConfig.viewportW} ${this._viewConfig.viewportH}`;
  }

  /**
   * Set up SVG viewbox attributes
   */
  calibrateViewBox(): void {
    this.visBase()
      .attr("viewBox", this._viewConfig.defaultView)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .on("dblclick.zoom", null);
  }

  /**
   * Set up x/y differential needed for the vis layout
   */
  setdXdY(): void {
    this._viewConfig.dx =
      this._viewConfig.canvasWidth / (this._viewConfig.levelsHigh as number * 2) - // Adjust for tree horizontal spacing on different screens
      +(this._viewConfig.isSmallScreen()) * 250;
    this._viewConfig.dy =
      this._viewConfig.canvasHeight / (this._viewConfig.levelsWide as number * 4);
    //adjust for taller aspect ratio
    this._viewConfig.dx *= this._viewConfig.isSmallScreen() ? 4.25 : 2;
    this._viewConfig.dy *= this._viewConfig.isSmallScreen() ? 3.25 : 2;
  }

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
    if (this.skipMainRender) { this.skipMainRender = false; return };
    if (this.noCanvas()) {
      this.setupCanvas();
    }

    if (this.firstRender()) {
      this.setLevelsHighAndWide();
      this.calibrateViewPortAttrs();
      this.calibrateViewBox();
      this.setdXdY();
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
      this.setNodeAndLabelGroups();
      this.appendNodesAndLabels();

      this.applyInitialTransform();

      this._hasRendered = true;
    }
  }

  // Utility methods for getting data about the state of the render:
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

  // Utility methods to do with base/canvas elements and clearing sub-elements:
  /**
   * Get a base/mounting element for the svg
   * @returns {Selection<SVGForeignObjectElement, HierarchyNode<any>, HTMLElement, any>} A d3 selection of the base HTML element
   */
  visBase(): Selection<SVGForeignObjectElement, HierarchyNode<any>, HTMLElement, any> {
    return select(`#${this._svgId}`);
  }
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
   * Clears all child elements from the canvas.
   * This is typically called before re-rendering the visualization with new data.
   */
  clearCanvas(): void {
    select(".canvas").selectAll("*").remove();
  }
}