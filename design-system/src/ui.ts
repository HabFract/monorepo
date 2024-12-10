import { Frequency as GraphQLFrequency } from "./generated-types";
export type ObjectValues<T extends Record<string, unknown>> = T[keyof T];
export type WinDataPerOrbitNode = {
  [nodeId: string]: any;
};
/**
 * Basic data for indexing and Orbit from either the IndexDB or the store
 */
export interface OrbitHashes {
  id: string;
  eH: string;
  sphereHash: string;
  childEh?: string;
  parentEh?: string;
}

/**
 * A flat representation of the union of an Orbit's data and metadata
 */
export interface OrbitDetails extends OrbitHashes {
  name: string;
  scale: any;
  frequency: Frequency.Rationals;
  sphereHash: string;
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


export const decodeFrequency = (
  frequency: GraphQLFrequency
): Frequency.Rationals => {
  switch (frequency) {
    case GraphQLFrequency.OneShot:
      return Frequency.ONE_SHOT;
    case GraphQLFrequency.DailyOrMore_1d:
      return Frequency.DAILY_OR_MORE.DAILY;
    case GraphQLFrequency.DailyOrMore_2d:
      return Frequency.DAILY_OR_MORE.TWO;
    case GraphQLFrequency.DailyOrMore_3d:
      return Frequency.DAILY_OR_MORE.THREE;
    // case GraphQLFrequency.DailyOrMore_4d:
    //   return Frequency.DAILY_OR_MORE.FOUR;
    // case GraphQLFrequency.DailyOrMore_5d:
    //   return Frequency.DAILY_OR_MORE.FIVE;
    // case GraphQLFrequency.DailyOrMore_6d:
    //   return Frequency.DAILY_OR_MORE.SIX;
    // case GraphQLFrequency.DailyOrMore_7d:
    //   return Frequency.DAILY_OR_MORE.SEVEN;
    // case GraphQLFrequency.DailyOrMore_8d:
    //   return Frequency.DAILY_OR_MORE.EIGHT;
    // case GraphQLFrequency.DailyOrMore_9d:
    //   return Frequency.DAILY_OR_MORE.NINE;
    // case GraphQLFrequency.DailyOrMore_10d:
    //   return Frequency.DAILY_OR_MORE.TEN;
    case GraphQLFrequency.LessThanDaily_1w:
      return Frequency.LESS_THAN_DAILY.WEEKLY;
    case GraphQLFrequency.LessThanDaily_1m:
      return Frequency.LESS_THAN_DAILY.MONTHLY;
    case GraphQLFrequency.LessThanDaily_1q:
      return Frequency.LESS_THAN_DAILY.QUARTERLY;
    default:
      throw new Error(`Unsupported GraphQL frequency: ${frequency}`);
  }
};
