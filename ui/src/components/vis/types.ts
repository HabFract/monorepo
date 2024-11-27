import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { HierarchyNode } from "d3-hierarchy";
import { Selection } from "d3-selection";
import { D3ZoomEvent, ZoomBehavior } from "d3-zoom";
import { SphereOrbitNodeDetails, SphereHashes } from "../../state/types/sphere";
import { Coords, NodeContent } from "../../state";

/**
 * Enum for visualization types.
 */
export enum VisType {
  Tree = "Tree",
  Cluster = "Cluster",
  Radial = "Radial",
}

/**
 * Enum for visualization coverage types.
 */
export enum VisCoverage {
  Partial = "partial", // Uses co-ordinates for navigation
  CompleteOrbit = "complete-orbit", // Uses zoom for navigation, starts at a given Orbit
  CompleteSphere = "complete-sphere", // Uses zoom for navigation, starts at the Sphere's root Orbits
}

/**
 * Props for the higher order component that wraps all vis types with a canvas and navigation controls,
 * depending on the coverage type.
 */
export type WithVisCanvasProps = { };

/**
 * Interface for the base visualization class.
 */
export interface IVisualization {
  /** Type of visualization */
  type: VisType;
  /** Whether we need zoom or traversal controls depends on the visualisation coverage type */
  coverageType: VisCoverage;
  /** ID of the SVG element */
  _svgId: string;
  /** Root data for the hierarchy */
  rootData: HierarchyNode<NodeContent> | null;
  /** View configuration */
  _viewConfig: ViewConfig;
  /** Zoom configuration */
  _zoomConfig: ZoomConfig;
  /** Event handlers */
  eventHandlers: EventHandlers;
  /** Flag indicating if the visualization has been rendered */
  _hasRendered: boolean;
  /** Flag helping to track if Orbit was just zoomed to */
  _lastOrbitId: EntryHashB64 | null;

  /** Set state handler for triggering modal open in the parent React component */
  modalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  /** Flag showing current status of is modal */
  isModalOpen: boolean;
  /** Allows setting/re-setting of the parent entry hash in the modal form */
  modalParentOrbitEh: React.Dispatch<
    React.SetStateAction<EntryHashB64 | undefined>
  >;
  /** Allows setting/re-setting of the child entry hash in the modal form */
  modalChildOrbitEh: React.Dispatch<
    React.SetStateAction<EntryHashB64 | undefined>
  >;

  /** Details of the current Sphere's nodes that are cached **/
  nodeDetails: SphereOrbitNodeDetails;

  /** A flag that can be used to bypass the main render function before manually triggering partial renders **/
  skipMainRender: boolean;

  // The following public methods may be called after addition/deletion of nodes to manually trigger a partial re-render
  setNodeAndLinkGroups: () => void;
  setNodeAndLinkEnterSelections: () => void;
  setNodeAndLabelGroups: () => void;
  appendNodeVectors: () => void;
  appendLinkPath: () => void;
  
  /** Apply initial transformation and zoom which may be needed when a node is already selected */
  applyInitialTransform: () => void;
  initializeZoomConfig: () => ZoomConfig;
  initializeZoomer: () => ZoomBehavior<Element, unknown> | null;
  handleZoom: (event: MouseEvent) => void;
  
  /** Method to fully render the visualization */
  render: () => void;

  /** Method to clean up/unbind event listeners */
  destroy(): void;
}

/**
 * Props for the visualization component.
 * @template T - The type of visualization, extending IVisualization.
 */
export type VisProps<T extends IVisualization> = {
  canvasHeight: number;
  canvasWidth: number;
  margin: Margins;
  /** Selected sphere action and entry hash as base64 */
  // selectedSphere: SphereHashes;
  // coords: Coords;
  /**
   * Render function for the visualization
   * @param currentVis - The current visualization instance
   * @returns React node to render
   */
  render: (currentVis: T) => React.ReactNode;
};

/**
 * Interface for event handlers used in the visualization.
 */
export interface EventHandlers {
  handleEditNode: ({ orbitEh }: { orbitEh: EntryHashB64 }) => void;
  handlePrependNode: ({ childOrbitEh }: { childOrbitEh: EntryHashB64 }) => void;
  handleAppendNode: ({
    parentOrbitEh,
  }: {
    parentOrbitEh: EntryHashB64;
  }) => void;
  handleDeleteNode?: (
    event: React.MouseEvent,
    node: HierarchyNode<unknown>
  ) => void;
  handleNodeZoom: (
    event: D3ZoomEvent<SVGSVGElement, unknown>,
    node: HierarchyNode<unknown>,
    forParent?: boolean
  ) => Selection<SVGGElement, HierarchyNode<any>, SVGGElement, unknown> | null;
  memoizedhandleNodeZoom: (
    id: EntryHashB64,
    foundNode?: HierarchyNode<NodeContent>
  ) => Selection<SVGGElement, HierarchyNode<any>, SVGGElement, unknown> | null;
  handleZoomOut: (
    event: D3ZoomEvent<SVGSVGElement, unknown>,
    node: HierarchyNode<unknown>,
    forParent?: boolean
  ) => void;
  handleNodeFocus?: (
    event: React.MouseEvent,
    node: HierarchyNode<unknown>
  ) => void;
  handleNodeClick?: (
    event: React.MouseEvent,
    node: HierarchyNode<unknown>
  ) => void;
}

/**
 * Configuration for the visualization view.
 */
export interface ViewConfig {
  dx?: number;
  dy?: number;
  scale: number;
  margin: Margins;
  viewportX?: number;
  viewportY?: number;
  viewportW?: number;
  viewportH?: number;
  canvasHeight: number;
  canvasWidth: number;
  levelsHigh?: number;
  levelsWide?: number;
  defaultCanvasTranslateX: () => number;
  defaultCanvasTranslateY: () => number;
  isSmallScreen: () => boolean;
  defaultView: string;
}

/**
 * Margins for the visualization canvas.
 */
export type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * Configuration for zoom functionality.
 */
export interface ZoomConfig {
  focusMode: boolean;
  previousRenderZoom: {
    event?: D3ZoomEvent<SVGSVGElement, unknown>;
    node?: HierarchyNode<NodeContent>;
    scale?: number;
  };
  zoomedInView: () => boolean;
  globalZoomScale?: number;
}
