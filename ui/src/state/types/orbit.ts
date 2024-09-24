import { Scale } from './../../graphql/generated/index';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
export type ObjectValues<T extends Record<string, unknown>> = T[keyof T]

export namespace Frequency {
  export const LESS_THAN_DAILY = {
    WEEKLY: 0.143, // 1/7 rounded to 3 decimal places
    MONTHLY: 0.032, // 1/31 rounded to 3 decimal places
    QUARTERLY: 0.011, // 1/91 rounded to 3 decimal places
  } as const;
  
  export const DAILY_OR_MORE = {
    DAILY: 1.000,
    TWO: 2.000,
    THREE: 3.000,
    FOUR: 4.000,
    FIVE: 5.000,
    SIX: 6.000,
    SEVEN: 7.000,
    EIGHT: 8.000,
    NINE: 9.000,
    TEN: 10.000,
    ELEVEN: 11.000,
    TWELVE: 12.000,
    THIRTEEN: 13.000,
    FOURTEEN: 14.000,
    FIFTEEN: 15.000,
    SIXTEEN: 16.000,
    SEVENTEEN: 17.000,
    EIGHTEEN: 18.000,
    NINETEEN: 19.000,
    TWENTY: 20.000,
    TWENTY_ONE: 21.000,
    TWENTY_TWO: 22.000,
    TWENTY_THREE: 23.000,
    HOURLY: 24.000,
  } as const;

  export type LessThanDailyIncrements = keyof typeof LESS_THAN_DAILY;
  export type LessThanDailyRationalRepresentation = ObjectValues<typeof LESS_THAN_DAILY>;

  export type DailyOrMoreIncrements = keyof typeof DAILY_OR_MORE;
  export type DailyOrMoreRationalRepresentation = ObjectValues<typeof DAILY_OR_MORE>;

  export type Rationals = LessThanDailyRationalRepresentation | DailyOrMoreRationalRepresentation;
}

/**
 * A flat representation of the union of an Orbit's data and metadata 
 */
export interface OrbitDetails {
  id: ActionHashB64;
  eH: EntryHashB64;
  name: string;
  scale: Scale;
  frequency?: Frequency.Rationals;
  startTime?: number;
  endTime?: number;
  description?: string;
  parentEh?: EntryHashB64;
  childEh?: EntryHashB64;
}

/**
 * Extra details that are dynamically calculate and cached but not persisted on the source chain
 */
export interface OrbitNodeDetails extends OrbitDetails {
  path?: string;
}

export type RootOrbitEntryHash = EntryHashB64;
export type CurrentOrbitId = ActionHashB64;