import { EntryHashB64 } from "@holochain/client";
import { SphereHashes } from "../../state/currentSphereHierarchyAtom";
import BaseVisualization from "./BaseVis";

export type WithVisCanvasProps = { // Passed to the finite state machine which renders the HOC
  orbitEh: EntryHashB64 // For partial VisCoverage
} | {
  currentSphereHash: EntryHashB64 // For complete VisCoverage
}

export type VisProps = { // for e.g. OrbitTree, OrbitCluster
  canvasHeight: number;
  canvasWidth: number;
  margin: Margins;
  selectedSphere: SphereHashes;
  breadthIndex: number;
  depthIndex: number;
  render: (currentVis: BaseVisualization, queryType: VisCoverage) => React.ReactNode;
}

export enum VisCoverage {
  Partial = "partial",
  Complete = "complete"
}

// BaseVisualization class property types/interfaces

export interface EventHandlers {
  handlePrependNode: () => void;
  handleAppendNode: ({parentOrbitEh} : {parentOrbitEh: EntryHashB64}) => void;
  handleDeleteNode: (event: any, node: any) => void; // Replace 'any' with specific event and node types
  rgtClickOrDoubleTap: (event: any, d: any) => void; // Replace 'any' with specific event and node types
  handleNodeZoom: (event: any, node: any, forParent?: boolean) => void; // Replace 'any' with specific event and node types
  handleNodeFocus: (event: any, node: any) => void; // Replace 'any' with specific event and node types
  handleMouseEnter: (event: any) => void; // Replace 'any' with specific event type
  handleMouseLeave: (event: any) => void; // Replace 'any' with specific event type
  handleHover: (event: any, d: any) => void; // Replace 'any' with specific event and node types
}

export interface ViewConfig {
  dx?: number;
  dy?: number;
  scale: number;
  clickScale: number;
  nodeRadius?: number;
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

export type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ZoomConfig {
  focusMode: boolean;
  previousRenderZoom: {
    event?: any; // Replace 'any' with a more specific type if possible
    node?: any; // Replace 'any' with a more specific type if possible
    scale?: number;
  };
  zoomedInView: () => boolean;
  globalZoomScale? : number;
}

export enum VisType {
  Tree = "Tree",
  Cluster = "Cluster",
  Radial = "Radial"
}

// Now define the interface to be implemented by the BaseVisualization class
export interface IVisualization {
  type: VisType;
  _svgId: string;
  rootData: any; // Replace 'any' with a more specific type representing the input tree structure
  _viewConfig: ViewConfig;
  _zoomConfig: ZoomConfig;
  eventHandlers: EventHandlers;
  expand: () => void;
  collapse: () => void;
  _hasRendered: boolean;
}