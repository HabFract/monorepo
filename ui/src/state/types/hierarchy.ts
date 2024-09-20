import { ActionHashB64 } from "@holochain/client";
import { CurrentOrbitId, OrbitNodeDetails, RootOrbitId } from "./orbit";

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

type Coords = { x: number, y: number };

/**
 * Hierarchy's current traversal indices
 */
type HierarchyTraversalIndices = Coords;

/**
 * A representation of the current hierarchy and its traversal state */
export interface Hierarchy {
  /** Acts as a unique identifier for the hierarchy */
  rootNode: RootOrbitId;
  /** The structure of the hierarchy as fed to the d3.hierarchy method */
  json: string;
  bounds: HierarchyBounds;
  indices?: HierarchyTraversalIndices;
  /** Currently selected Orbit in the hierarchy */
  currentNode?: CurrentOrbitId;
  /** Data on the orbits of the hierarchy which is used to annotate/calculate completion of each node  */
  nodes: Record<ActionHashB64, OrbitNodeDetails>;
}