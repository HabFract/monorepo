import { ActionHashB64 } from "@holochain/client";
import { Frequency, OrbitNodeDetails } from "./orbit";

// Helper type to create a fixed-length array type
export type FixedLengthArray<T, L extends number> = [T, ...T[]] & { length: L };

// WinData type that depends on the frequency
export type WinData<F extends Frequency.Rationals> =
  F extends Frequency.DailyOrMoreRationalRepresentation
    ? { [dayIndex: string]: FixedLengthArray<boolean, F> }
    : { [dayIndex: string]: boolean };

// WinState type that uses a mapped type to create frequency-dependent WinData for each orbit
export type WinDataPerOrbitNode = {
  [nodeId: ActionHashB64]: WinData<OrbitNodeDetails["frequency"]>;
};

export default WinDataPerOrbitNode;
