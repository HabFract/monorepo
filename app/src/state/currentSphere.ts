import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { atom } from "jotai";

export interface SphereHashes {
  entryHash?: EntryHashB64;
  actionHash?: ActionHashB64;
}

export const currentSphere = atom<SphereHashes>({ entryHash: "",  actionHash: "", });