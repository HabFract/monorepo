import { select, Selection } from "d3-selection";
import { zoom, ZoomBehavior } from "d3-zoom";
import { HierarchyLink, HierarchyNode, tree } from "d3-hierarchy";
import { easeCubic, easeLinear } from "d3-ease";
import _ from "lodash";

import {
  BASE_SCALE,
  DX_RESCALE_FACTOR_MD_LG,
  DX_RESCALE_FACTOR_SM,
  DY_RESCALE_FACTOR_MD_LG,
  DY_RESCALE_FACTOR_SM,
  FOCUS_MODE_SCALE,
  LG_LEVELS_HIGH,
  LG_LEVELS_WIDE,
  XS_LEVELS_HIGH,
  XS_LEVELS_WIDE,
} from "../constants";
import {
  EventHandlers,
  IVisualization,
  Margins,
  ViewConfig,
  VisCoverage,
  VisType,
  ZoomConfig,
} from "../types";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { GetOrbitsDocument, Orbit, Scale } from "../../../graphql/generated";
import { client } from "../../../graphql/client";
import { store } from "../../../state/store";
import { mapToCacheObject } from "../../../state/orbit";
import { newTraversalLevelIndexId } from "../../../state/hierarchy";
import { OrbitNodeDetails } from "../../../state/types";
import { extractEdges } from "../../../graphql/utils";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { currentOrbitIdAtom } from "../../../state/orbit";
import { SphereOrbitNodeDetails } from "../../../state/types/sphere";
import { NODE_ENV } from "../../../constants";
import { getScaleForPlanet } from "../tree-helpers";

/**
 * Base class for creating D3 hierarchical visualizations.
 * This class handles the setup and rendering of the visualization.
 * Extend this class to implement specific types of visualizations.
 */
export abstract class BaseVisualization implements IVisualization {
  type: VisType;
  coverageType: VisCoverage;
  rootData: HierarchyNode<any>;
  nodeDetails: SphereOrbitNodeDetails;
  _nextRootData: HierarchyNode<any> | null;

  _json?: string;
  _originalRootData?: HierarchyNode<any>;
  _svgId: string;
  _canvas: Selection<SVGGElement, unknown, HTMLElement, any> | undefined;
  _viewConfig: ViewConfig;
  _zoomConfig: ZoomConfig;
  _lastOrbitId!: EntryHashB64 | null;

  // Current Vis sphere context:
  sphereEh: EntryHashB64;
  sphereAh: ActionHashB64;
  // State handlers passed from parent React component:
  modalParentOrbitEh!: React.Dispatch<
    React.SetStateAction<EntryHashB64 | undefined>
  >;
  modalChildOrbitEh!: React.Dispatch<
    React.SetStateAction<EntryHashB64 | undefined>
  >;
  globalStateTransition: Function;

  eventHandlers: EventHandlers;
  zoomer!: ZoomBehavior<Element, unknown>;

  _gLink?: typeof this._canvas;
  _gNode?: typeof this._canvas;
  _gCircle?: Selection<SVGGElement, HierarchyNode<any>, SVGGElement, unknown>;
  _gTooltip?: Selection<
    SVGForeignObjectElement,
    HierarchyNode<any>,
    SVGGElement,
    unknown
  >;
  _gButton?: Selection<
    SVGForeignObjectElement,
    HierarchyNode<any>,
    SVGGElement,
    unknown
  >;
  _enteringLinks?: Selection<
    SVGPathElement,
    HierarchyLink<any>,
    SVGGElement,
    unknown
  >;
  _enteringNodes?: Selection<
    SVGGElement,
    HierarchyNode<any>,
    SVGGElement,
    unknown
  >;

  // Methods for procedures at different parts of the vis render:
  abstract setNodeAndLinkEnterSelections(): void;
  abstract appendNodeVectors(): void;
  abstract setNodeAndLabelGroups(): void;
  abstract appendLinkPath(): void;
  abstract bindEventHandlers(selection: any): void;
  abstract getLinkPathGenerator(): void;

  abstract initializeViewConfig(
    canvasHeight: number,
    canvasWidth: number,
    margin: Margins,
  ): ViewConfig;
  abstract initializeEventHandlers(): EventHandlers;

  modalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isModalOpen: boolean = false;
  skipMainRender: boolean = false;
  startInFocusMode: boolean = false;
  activeNode: any = null;
  isNewActiveNode: boolean = false;
  _lastRenderParentId: EntryHashB64 | null = null;
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
    coverageType: VisCoverage,
    svgId: string,
    inputTree: HierarchyNode<any>,
    canvasHeight: number,
    canvasWidth: number,
    margin: Margins,
    globalStateTransition: (newState: string, params: object) => void,
    sphereEh: EntryHashB64,
    sphereAh: ActionHashB64,
    nodeDetails: SphereOrbitNodeDetails,
  ) {
    this.type = type;
    this.coverageType = coverageType;
    this._svgId = svgId;
    this.rootData = inputTree;
    this.globalStateTransition = globalStateTransition;
    this.sphereEh = sphereEh;
    this.sphereAh = sphereAh;
    this.nodeDetails = nodeDetails;
    this._nextRootData = null;

    this._viewConfig = this.initializeViewConfig(
      canvasHeight,
      canvasWidth,
      margin,
    );
    this._zoomConfig = this.initializeZoomConfig();
    this.eventHandlers = this.initializeEventHandlers();
  }

  // Allow data to be re-cached after certain vis interactions:
  /**
   * Fetches Orbit data for a given Sphere.
   */
  async refetchOrbits() {
    const variables = { sphereEntryHashB64: this.sphereEh };
    let data;
    try {
      const gql: ApolloClient<NormalizedCacheObject> =
        (await client) as ApolloClient<NormalizedCacheObject>;
      data = await gql.query({
        query: GetOrbitsDocument,
        variables,
        fetchPolicy: "network-only",
      });
      if (data?.data?.orbits) {
        const orbits = extractEdges(data.data.orbits) as Orbit[];
        const indexedOrbitData: Array<[EntryHashB64, OrbitNodeDetails]> =
          Object.entries(orbits.map(mapToCacheObject)).map(([_idx, value]) => [
            value.eH,
            value,
          ]);
        this.cacheOrbits(indexedOrbitData);
      }
      console.log("refetched orbits :>> ", data);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Caches Orbit data for a given Sphere.
   */
  async cacheOrbits(orbitEntries: Array<[EntryHashB64, OrbitNodeDetails]>) {
    // try {
    //   store.set(nodeCache.setMany, orbitEntries);
    //   //@ts-ignore
    //   // TODO check this form before using
    //   this.nodeDetails = Object.entries(orbitEntries);
    //   console.log("Sphere orbits fetched and cached!");
    // } catch (error) {
    //   console.error("error :>> ", error);
    // }
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
      .attr("preserveAspectRatio", "xMidYMid meet");
  }

  /**
   * Set up x/y differential needed for the vis layout
   */
  setdXdY(): void {
    this._viewConfig.dx =
      this._viewConfig.canvasWidth /
      ((this._viewConfig.levelsHigh as number) * 2) - // Adjust for tree horizontal spacing on different screens
      +this._viewConfig.isSmallScreen() * 150;
    this._viewConfig.dy =
      this._viewConfig.canvasHeight /
      ((this._viewConfig.levelsWide as number) * 6);
    //adjust for taller aspect ratio
    this._viewConfig.dx *= this._viewConfig.isSmallScreen() ? DX_RESCALE_FACTOR_SM : DX_RESCALE_FACTOR_MD_LG;
    this._viewConfig.dy *= this._viewConfig.isSmallScreen() ? DY_RESCALE_FACTOR_SM : DY_RESCALE_FACTOR_MD_LG;
  }

  /**
   * Set up node and link groups.
   */
  setNodeAndLinkGroups(): void {
    !this.firstRender() && this.clearNodesAndLinks();

    this._gLink = this._canvas!.append("g").classed("links", true)
    .attr("style", "transform: translateY(148px)");
    this._gNode = this._canvas!.append("g").classed("nodes", true);
    // .attr("transform", transformation);
  }

  /**
   * Render the visualization.
   */
  public render(): void {
    if (this.skipMainRender) {
      this.skipMainRender = false;
      return;
    }
    if (this.noCanvas()) {
      this.setupCanvas();
    }

    if (this.firstRender()) {
      this.setLevelsHighAndWide();
      this.calibrateViewPortAttrs();
      this.calibrateViewBox();
      this.setdXdY();
      this._originalRootData = this.rootData;
    }

    if (this.firstRender() || this.hasNextData()) {
      this.clearCanvas();

      let hasUpdated;
      if (this.hasNextData()) {
        this.rootData = this._nextRootData!;
        this._nextRootData = null;
        hasUpdated = true;
      }

      this.setupLayout();
      this.setNodeAndLinkGroups();
      this.setNodeAndLinkEnterSelections();
      this.setNodeAndLabelGroups();
      this.firstRender() && this.appendNodeVectors();
      this.appendLinkPath();

      if (!hasUpdated) {
        this.applyInitialTransform();
        this.eventHandlers.memoizedhandleNodeZoom.call(
          this,
          this.rootData.data.content,
        )
      }
      if (!(this.coverageType == VisCoverage.Partial || this.noCanvas())) {
        this.initializeZoomer();
      }

      const newRenderNodeDetails = store.get(newTraversalLevelIndexId);
      const finalNodeToFocus = newRenderNodeDetails?.id;
      if (this.startInFocusMode && hasUpdated) {
        // console.log('Actual new focus node :>> ', finalNodeToFocus);

        this._lastOrbitId = null;
        const initialNodeZoomId =
          newRenderNodeDetails?.intermediateId || finalNodeToFocus || this._lastRenderParentId;

        let initialZoom = this.eventHandlers.memoizedhandleNodeZoom.call(
          this,
          initialNodeZoomId,
          this.rootData.find(node => node.data.content == initialNodeZoomId)
        );
        if (newRenderNodeDetails?.intermediateId) {
          (initialZoom as any)
            .on("end", () => {
              this.eventHandlers.memoizedhandleNodeZoom.call(this, finalNodeToFocus);
              console.log('Using intermediate node :>> ', newRenderNodeDetails.intermediateId);
            });
        }

        store.set(newTraversalLevelIndexId, { id: null, intermediateId: null });
        this.startInFocusMode = false;
      }
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
   * @returns {boolean} True if there is new data (_nextRootData is not null and the data has a different root), false otherwise.
   */
  hasNextData(): boolean {
    return this._nextRootData !== null && this._nextRootData.data.content !== this.rootData.data.content;
  }

  // Utility methods to do with base/canvas elements and clearing sub-elements:
  /**
   * Get a base/mounting element for the svg
   * @returns {Selection<SVGForeignObjectElement, HierarchyNode<any>, HTMLElement, any>} A d3 selection of the base HTML element
   */
  visBase(): Selection<
    SVGForeignObjectElement,
    HierarchyNode<any>,
    HTMLElement,
    any
  > {
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
    this._canvas!.selectAll("g.nodes").remove();
    this._canvas!.selectAll("g.links").remove();
  }

  /** Clear labels and re-append  **/
  clearAndRedrawLabels(): Selection<
    SVGForeignObjectElement,
    HierarchyNode<any>,
    SVGGElement,
    unknown
  > {
    !this.firstRender() && this._canvas!.selectAll(".tooltip").remove();

    return this._enteringNodes!.append("g")
      .classed("tooltip", true)
      .append("foreignObject")
      .attr("transform", (d) => {
        const cachedNode = this.nodeDetails[d.data.content];
        const { scale } = cachedNode;

        return `scale(${this._viewConfig.isSmallScreen() ? getScaleForPlanet(scale)/3 : 0.75})`;
      })
      .attr("x", "-375")
      .attr("y", (d) => {
        const cachedNode = this.nodeDetails[d.data.content];
        const { scale } = cachedNode;
        return scale == Scale.Atom ? "-150" : Scale.Sub ? "0" : "-50";
      })
      .attr("width", "50")
      .attr("height", "50")
      .style("overflow", "visible")
      .html(this.appendLabelHtml);
  }

  /**
   * Reset the zoom on the vis base
   */
  resetZoomer(): void {
    const zoomer: ZoomBehavior<Element, unknown> = zoom();
    select("#vis") && select("#vis")!.call(zoomer as any);
    this.initializeZoomConfig()
  }

  applyInitialTransform(toSelection?: Selection<SVGGElement, unknown, HTMLElement, any>): void {
    (toSelection || this._canvas)!.attr(
      "transform",
      `scale(${this._viewConfig.scale}), translate(${this._viewConfig.defaultCanvasTranslateX()}, ${this._viewConfig.defaultCanvasTranslateY()})`
    );
  }

  initializeZoomConfig(focused: boolean = false): ZoomConfig {
    return {
      focusMode: focused,
      previousRenderZoom: {},
      globalZoomScale: focused ? FOCUS_MODE_SCALE : this._viewConfig.scale,
      zoomedInView: function () {
        return Object.keys(this.previousRenderZoom).length !== 0;
      },
    };
  }

  initializeZoomer(): ZoomBehavior<Element, unknown> {
    const zoomer: ZoomBehavior<Element, unknown> = zoom()
      .scaleExtent([1, 1.5])
      .on("zoom", this.handleZoom.bind(this) as any);
    select("#vis") && select("#vis")!.call(zoomer as any);
    return (this.zoomer = zoomer);
  }

  handleZoom(event: any): void {
    let t = { ...event.transform };
    let scale;
    let x, y;
    if (this._zoomConfig.focusMode) {
      this._zoomConfig.focusMode = false;
      return;
    } else {
      scale = t.k;
      x = t.x * scale;
      y = t.y * scale;
    }
    !!(NODE_ENV !== 'test' && !this.noCanvas()) && this._canvas!
      //@ts-expect-error
      .transition()
      .ease(easeLinear)
      .duration(200)
      .attr("transform", `translate(${x},${y}), scale(${scale})`);
  }

  zoomOut(): void {
    if (!this._zoomConfig.focusMode) return;

    this._zoomConfig.focusMode = false;
    this._zoomConfig.globalZoomScale = this._viewConfig.scale;

    this.initializeZoomer();
    //@ts-expect-error
    this.applyInitialTransform(this._canvas!.transition().duration(750));
    this._zoomConfig.focusMode = false;
    this._zoomConfig.previousRenderZoom = {};
  }
  /**
   * Clears all child elements from the canvas.
   * This is typically called before re-rendering the visualization with new data.
   */
  clearCanvas(): void {
    select(".canvas").selectAll("*").remove();
  }

  appendLabelHtml = (d): string => {
    if (!d?.data?.content || !this.nodeDetails[d.data.content]) return "";
    const isCurrentOrbit = store.get(currentOrbitIdAtom)?.id === d.data.content;
    if (!isCurrentOrbit) return "";

    const cachedNode = this.nodeDetails[d.data.content];
    const { name, description, scale } = cachedNode;
    return `<div class="tooltip-inner">
      <div class="content">
      <span class="title">Name:</span>
      <p>${name}</p>
      <span class="title">Description:</span>
      <p>${description || "<br />"}</p>
      </div>
    </div>`;
  };
}
