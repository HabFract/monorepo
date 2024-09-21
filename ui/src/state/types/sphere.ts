import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { Hierarchy } from "./hierarchy";
import { RootOrbitEntryHash } from "./orbit";

export interface SphereDetails {
  entryHash: EntryHashB64;
  name: string;
  description?: string;
  hashtag?: string;
  image?: string;
}

export type SphereEntry = {
  details: SphereDetails;
  hierarchies: Record<RootOrbitEntryHash, Hierarchy>;
};

export interface SphereHashes {
  entryHash?: EntryHashB64;
  actionHash?: ActionHashB64;
}

export default interface SphereState {
  currentSphereHash: ActionHashB64;
  spheres: Record<ActionHashB64, SphereEntry>;
}
