import { select, Selection } from "d3-selection";
import { zoom, ZoomBehavior } from "d3-zoom";
import { HierarchyLink, HierarchyNode, tree } from "d3-hierarchy";
import { easeLinear } from "d3-ease";
import { renderToStaticMarkup } from 'react-dom/server';

import {
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
import { ActionHashB64, EntryHashB64 } from "@state/types";
import { Scale } from "../../../graphql/generated";
import { store } from "../../../state/store";
import { currentOrbitDetailsAtom } from "../../../state/orbit";
import { newTraversalLevelIndexId } from "../../../state/hierarchy";
import { NodeContent } from "../../../state/types";
import { currentOrbitIdAtom } from "../../../state/orbit";
import { SphereOrbitNodeDetails } from "../../../state/types/sphere";
import { NODE_ENV } from "../../../constants";
import { getLabelScale } from "../tree-helpers";
import { OrbitControls, OrbitLabel } from "habit-fract-design-system";
import { currentDayAtom } from "../../../state";
import { AppMachine } from "../../../main";
import { debounce } from "../helpers";
import memoizeOne from "memoize-one";

/**
 * Base class for creating D3 hierarchical visualizations.
 * This class handles the setup and rendering of the visualization.
 * Extend this class to implement specific types of visualizations.
 */
export abstract class BaseVisualization implements IVisualization {
  type: VisType;
  coverageType: VisCoverage;
  rootData: HierarchyNode<NodeContent> | null;
  nodeDetails: SphereOrbitNodeDetails;
  _nextRootData: HierarchyNode<any> | null;

  _json?: string;
  _originalRootData?: HierarchyNode<NodeContent> | null;
  _svgId: string;
  _canvas?: Selection<SVGGElement, unknown, HTMLElement, any> | null;
  _viewConfig: ViewConfig;
  _zoomConfig: ZoomConfig;
  _lastOrbitId!: EntryHashB64 | null;
  _subscriptions!: Array<unknown>;

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
  zoomer?: ZoomBehavior<Element, unknown> | null;

  _gLink?: typeof this._canvas;
  _gNode?: typeof this._canvas;
  _gCircle?: Selection<SVGGElement, HierarchyNode<any>, SVGGElement, unknown> | null;
  _gTooltip?: Selection<
    SVGForeignObjectElement,
    HierarchyNode<any>,
    SVGGElement,
    unknown
  > | null;
  _gButton?: Selection<
    SVGForeignObjectElement,
    HierarchyNode<any>,
    SVGGElement,
    unknown
  > | null;
  _enteringLinks?: Selection<
    SVGPathElement,
    HierarchyLink<any>,
    SVGGElement,
    unknown
  > | null;
  _enteringNodes?: Selection<
    SVGGElement,
    HierarchyNode<any>,
    SVGGElement,
    unknown
  > | null;

  // Methods for procedures at different parts of the vis render:
  abstract setNodeAndLinkEnterSelections(): void;
  abstract appendNodeVectors(): void;
  abstract setNodeAndLabelGroups(): void;
  abstract appendLinkPath(): void;
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
    this._subscriptions = [];
    this._nextRootData = null;

    this._viewConfig = this.initializeViewConfig(
      canvasHeight,
      canvasWidth,
      margin,
    );
    this._zoomConfig = this.initializeZoomConfig();
    this.eventHandlers = this.initializeEventHandlers();
  }

  bindEventHandlers() {
    this.unbindEventHandlers();

    /* Create memoized handlers */
    const memoizedHandleClick = memoizeOne((e, d) => {
      store.set(currentOrbitIdAtom, d.data.content);
      this.eventHandlers.handleNodeClick!.call(this, e, d);
    });

    const debouncedZoom = debounce((nodeId) =>
      Promise.resolve(this.eventHandlers.memoizedhandleNodeZoom.call(this, nodeId))
      , 1000);

    const handleOrbitIdChange = memoizeOne((newId) => {
      if (AppMachine.state.currentState !== "Vis") return;
      this.eventHandlers.handleNodeClick!.call(this, {} as any, {} as any);
      debouncedZoom(newId);
    });

    const handleNodeEvent = (event: Event) => {
      const target = event.target as HTMLElement;
      const nodeGroup = target.closest('.the-node');
      if (!nodeGroup) return;

      const d = (nodeGroup as any).__data__;
      if (event.type === 'click') {
        memoizedHandleClick(event, d);
      }
    };

    /* Bind to parent node group */
    const nodeContainer = this._canvas!.select('g.nodes');
    nodeContainer.on('click', handleNodeEvent);

    const handleCurrentDayChange = () => {
      if (AppMachine.state.currentState !== "Vis") return;
      this.eventHandlers.handleNodeClick!.call(this, {} as any, {} as any);
    };

    const subOrbitId = store.sub(currentOrbitIdAtom, () => {
      const newId = store.get(currentOrbitDetailsAtom)?.eH;
      handleOrbitIdChange(newId);
    });
    const subCurrentDay = store.sub(currentDayAtom, handleCurrentDayChange);
    this._subscriptions.push(subOrbitId, subCurrentDay);
  }

  unbindEventHandlers() {
    if (this._canvas) {
      this._canvas.selectAll('*').on('.', null);
    }

    // Clear subscriptions
    if (this._subscriptions) {
      this._subscriptions.forEach((unsub: any) => unsub());
      this._subscriptions = [];
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
    if (!this.firstRender()) {
      this.unbindEventHandlers();
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

      this.appendNodeVectors();
      this.appendLinkPath();
      this._gTooltip = this.clearAndRedrawLabels();

      if (!hasUpdated) {
        this.applyInitialTransform();
        this.eventHandlers.memoizedhandleNodeZoom.call(
          this,
          this.rootData!.data.content,
        )
      }
      if (this.firstRender()) this.bindEventHandlers();
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
          this.rootData!.find(node => node.data.content == initialNodeZoomId)
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
    return this._nextRootData !== null && this._nextRootData.descendants().length !== this.rootData!.descendants().length;
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
      !this._canvas ||
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

        return `scale(${this._viewConfig.isSmallScreen() ? getLabelScale(scale) : 0.75})`;
      })
      .attr("y", (d) => {
        const cachedNode = this.nodeDetails[d.data.content];
        const { scale, parentEh } = cachedNode;

        return scale == Scale.Astro
          ? (!parentEh ? "-40" : "-30")
          : scale == Scale.Sub
            ? (!parentEh ? "20" : "40")
            : (!parentEh ? "55" : "75");
      })
      .attr("x", (d) => {
        const cachedNode = this.nodeDetails[d.data.content];
        const { scale, parentEh } = cachedNode;
        return !parentEh ? "-122" : "-90"
      })
      .attr("width", (d) => {
        const cachedNode = this.nodeDetails[d.data.content];
        const { scale, parentEh } = cachedNode;
        return !parentEh ? "246" : "220"
      })
      .attr("height", "300")
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
    const { name, description, frequency, eH } = this.nodeDetails[d.data.content];

    const controlsMarkup = renderToStaticMarkup(<OrbitControls handleAppendNode={() => { }} handleEdit={() => { }} nodeEh={eH} />); // Events bound on the general node click handler
    const labelMarkup = renderToStaticMarkup(<OrbitLabel orbitDetails={{ name, description, frequency }} />);
    return `<div class="orbit-overlay-container">${controlsMarkup}${labelMarkup}</div>`;
  };

  public destroy(): void {
    this.unbindEventHandlers();

    // Remove zoom behavior
    if (this.zoomer) {
      select("#vis").on('.zoom', null);
    }
    // Remove all D3 selections
    if (this._canvas) {
      this._canvas.selectAll('*').remove();
      this._canvas.remove();
    }
    if (this._svgId) {
      select(`#${this._svgId}`).remove();
    }

    select('body').selectAll('foreignObject').remove();

    // Nullify large objects
    this.rootData = null;
    this._nextRootData = null;
    this._originalRootData = null;
    this._canvas = null;
    this._gLink = null;
    this._gNode = null;
    this._gCircle = null;
    this._gTooltip = null;
    this._gButton = null;
    this._enteringLinks = null;
    this._enteringNodes = null;

    console.log('BaseVisualization destroyed');
  }
}
