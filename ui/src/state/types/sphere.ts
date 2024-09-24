import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { Hierarchy } from "./hierarchy";
import { OrbitNodeDetails, RootOrbitEntryHash } from "./orbit";

export interface SphereDetails {
  entryHash: EntryHashB64;
  name: string;
  description?: string;
  hashtag?: string;
  image?: string;
}

export type SphereOrbitNodes = {
  [key: ActionHashB64]: OrbitNodeDetails;
};

export type SphereEntry = {
  details: SphereDetails;
  hierarchies: Record<RootOrbitEntryHash, Hierarchy>;
};

export interface SphereHashes {
  entryHash?: EntryHashB64;
  actionHash?: ActionHashB64;
}
