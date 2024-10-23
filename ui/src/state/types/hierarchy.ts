import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { CurrentOrbitId, RootOrbitEntryHash } from "./orbit";
import { Scale } from "../../graphql/generated";

/**
 *  Bounds for the min/max traversal indices.
 * - we can visualize the whole of the current hierarchy as a matrix of smaller d3 hierarchy visualizations
 * - this stores the current matrix's limits in x and y respectively which can be used to bound the current hierarchy indices
 */
export interface HierarchyBounds {
  minBreadth: number;
  maxBreadth: number;
  minDepth: number;
  maxDepth: number;
}

export type NodeContent = { content: EntryHashB64 };

export interface SphereHierarchyBounds {
  [sphereId: EntryHashB64]: HierarchyBounds;
}

export type Coords = { x: number; y: number };

/**
 * Hierarchy's current traversal indices
 */
export type HierarchyTraversalIndices = Coords;

/**
 * A representation of the current hierarchy and its traversal state */
export interface Hierarchy {
  /** Acts as a unique identifier for the hierarchy */
  rootNode: RootOrbitEntryHash;
  /** The structure of the hierarchy as fed to the d3.hierarchy method */
  json: string;
  bounds?: HierarchyBounds;
  indices?: HierarchyTraversalIndices;
  /** Currently selected Orbit in the hierarchy */
  currentNode?: CurrentOrbitId;
  /** Reference to the nomalised orbit nodes of the hierarchy which will be needed to extract and serialise full hierarchy data  */
  nodeHashes: Array<ActionHashB64>;
  leafNodeHashes: Array<ActionHashB64>;
}

// Type for consolidated navigation flags
export interface ConsolidatedFlags {
  canGoUp: boolean;
  canGoDown: boolean;
  canGoLeft: boolean;
  canGoRight: boolean;
}

// Type for consolidated navigation actions
export interface ConsolidatedActions {
  moveLeft: () => void;
  moveRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
}

// Slimmed down OrbitNodeDetails for the Vis Vertical/Lateral controls on mobile
export interface OrbitDescendant {
  orbitName: string;
  orbitScale: Scale;
}
