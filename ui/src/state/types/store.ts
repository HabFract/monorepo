import { RootOrbitEntryHash } from "./orbit";
import { SphereEntry, SphereOrbitNodes } from "./sphere";
import WinState, { WinDataPerOrbitNode } from "./win";
import { ActionHashB64 } from "@state/types";
import { Hierarchy } from "./hierarchy";
import { store } from "../store";

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
    byHash: SphereOrbitNodes; // The sphere part or SphereOrbitNodes is not relevant in this context but we use the shared type for now
  };
  wins: WinDataPerOrbitNode;
  ui: {
    listSortFilter: {
      sortCriteria: string;
      sortOrder: string;
    };
    currentDay: string;
    handedness: "left" | "right";
    performanceMode: "snappy" | "snancy" | "fancy";
  };
}

export type StoreType = typeof store;

export type SetAtom<Args extends any[], Result> = (...args: Args) => Result;
