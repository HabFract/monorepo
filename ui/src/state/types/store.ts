import { atomWithStorage } from "jotai/utils";
import { RootOrbitEntryHash } from "./orbit";
import { SphereDetails, SphereEntry, SphereOrbitNodes } from "./sphere";
import WinState from "./win";
import { ActionHashB64 } from "@holochain/client";
import { Hierarchy } from "./hierarchy";

export interface AppState {
  spheres: {
    currentSphereHash: ActionHashB64;
    byHash: Record<ActionHashB64, SphereEntry>;
  };
  hierarchies: {
    byRootOrbitEntryHash: Record<RootOrbitEntryHash, Hierarchy>;
  };
  orbitNodes: {
    currentOrbitHash: ActionHashB64 | null;
    byHash: SphereOrbitNodes; // The sphere part here is not relevant but we use the shared type for now
  };
  wins: WinState;
  ui: {
    listSortFilter: {
      sortCriteria: string;
      sortOrder: string;
    };
    currentDay: string;
  };
}
