import { EntryHashB64 } from "@holochain/client";
import { ReactNode } from "react";
import { SphereHashes } from "../../state/currentSphereHierarchyAtom";

export type VisParams = {
  orbitEh: EntryHashB64
} | {
  currentSphereHash: EntryHashB64
}

export type VisComponent = { // e.g. OrbitTree, OrbitCluster
  canvasHeight: number;
  canvasWidth: number;
  margin: Margins;
  selectedSphere: SphereHashes;
  breadthIndex: number;
  depthIndex: number;
  render: (currentVis: any, queryType: string) => JSX.Element;
}

export interface EventHandlers {
  handlePrependNode: () => void;
  handleAppendNode: () => void;
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

// Now define the interface for the Visualization class
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

export interface Hierarchy {
  id: number;
  hier: object;
}

export interface VisProps {
  canvasHeight: number;
  canvasWidth?: number;
  margin: Margins;
  render: (_:any) => ReactNode;
}
