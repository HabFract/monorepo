import { Scale } from "./../../graphql/generated/index";
import { ActionHashB64, EntryHashB64 } from "@state/types";
export type ObjectValues<T extends Record<string, unknown>> = T[keyof T];

export namespace Frequency {
  export const LESS_THAN_DAILY = {
    WEEKLY: 0.143, // 1/7 rounded to 3 decimal places
    MONTHLY: 0.032, // 1/31 rounded to 3 decimal places
    QUARTERLY: 0.011, // 1/91 rounded to 3 decimal places
  } as const;

  export const ONE_SHOT = 0;

  export const DAILY_OR_MORE = {
    DAILY: 1.0,
    TWO: 2.0,
    THREE: 3.0,
    FOUR: 4.0,
    FIVE: 5.0,
    SIX: 6.0,
    SEVEN: 7.0,
    EIGHT: 8.0,
    NINE: 9.0,
    TEN: 10.0,
    ELEVEN: 11.0,
    TWELVE: 12.0,
    THIRTEEN: 13.0,
    FOURTEEN: 14.0,
    FIFTEEN: 15.0,
    SIXTEEN: 16.0,
    SEVENTEEN: 17.0,
    EIGHTEEN: 18.0,
    NINETEEN: 19.0,
    TWENTY: 20.0,
    TWENTY_ONE: 21.0,
    TWENTY_TWO: 22.0,
    TWENTY_THREE: 23.0,
    HOURLY: 24.0,
  } as const;

  export type LessThanDailyIncrements = keyof typeof LESS_THAN_DAILY;
  export type LessThanDailyRationalRepresentation = ObjectValues<
    typeof LESS_THAN_DAILY
  >;

  export type DailyOrMoreIncrements = keyof typeof DAILY_OR_MORE;
  export type DailyOrMoreRationalRepresentation = ObjectValues<
    typeof DAILY_OR_MORE
  >;

  export type Rationals =
    | LessThanDailyRationalRepresentation
    | DailyOrMoreRationalRepresentation
    | typeof ONE_SHOT;
}

/**
 * Basic data for indexing and Orbit from either the IndexDB or the store
 */
export interface OrbitHashes {
  id: ActionHashB64;
  eH: EntryHashB64;
  sphereHash: EntryHashB64;
  childEh?: EntryHashB64;
  parentEh?: EntryHashB64;
}

/**
 * A flat representation of the union of an Orbit's data and metadata
 */
export interface OrbitDetails extends OrbitHashes {
  name: string;
  scale: Scale;
  frequency: Frequency.Rationals;
  sphereHash: EntryHashB64;
  startTime?: number;
  endTime?: number;
  description?: string;
}

/**
 * Extra details that are dynamically calculate and cached but not persisted on the source chain
 */
export interface OrbitNodeDetails extends OrbitDetails {
  path?: string;
}

export type RootOrbitEntryHash = EntryHashB64;
export type CurrentOrbitId = ActionHashB64;
