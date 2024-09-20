import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { Hierarchy } from "./hierarchy";
import { RootOrbitId } from "./orbit";

export interface SphereDetails {
  entryHash: EntryHashB64;
  name: string;
  description?: string;
  hashtag?: string;
  image?: string;
}

export type SphereEntry = {
  details: SphereDetails;
  hierarchies: Record<RootOrbitId, Hierarchy>;
};

export default interface SphereState {
  currentSphereHash: ActionHashB64;
  spheres: Record<ActionHashB64, SphereEntry>;
}