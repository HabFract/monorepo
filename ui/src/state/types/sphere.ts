import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { Hierarchy } from "./hierarchy";
import { OrbitHashes, OrbitNodeDetails, RootOrbitEntryHash } from "./orbit";

export interface SphereDetails {
  entryHash: EntryHashB64;
  name?: string;
  description?: string;
  hashtag?: string;
  image?: string;
}

/**
 * Since we need an async dictionary for quick access to node details from the vis (below), 
 * we will just keep the hashes in the store and pluck from the IndexDB 
 * any NodeDetails cache data needed for serialisation/local storage
 */
export type SphereOrbitNodes = {
  [key: ActionHashB64]: OrbitHashes;
};

/**
 * Full OrbitNodeDetails including hierarchy link path for appendage in the vis.
 * This form and storage method allows easy async access to potentially large files that may
 * be attached as details of a plannit hierarchy node later down the line. 
 */
export type SphereOrbitNodeDetails = {
  [key: EntryHashB64]: OrbitNodeDetails;
};

export type SphereEntry = {
  details: SphereDetails;
  hierarchies: Record<RootOrbitEntryHash, Hierarchy>;
};

export interface SphereHashes {
  entryHash?: EntryHashB64;
  actionHash?: ActionHashB64;
}
