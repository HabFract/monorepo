import { ApolloClient } from "@apollo/client";
import { EntryHashB64 } from "@state/types";
import { toYearDotMonth } from "habit-fract-design-system";
import { DateTime } from "luxon";
import { GetWinRecordForOrbitForMonthDocument } from "./generated";
import { winDataArrayToWinRecord } from "@state/win";
import { decode } from "@msgpack/msgpack";
import { Base64 } from "js-base64";

export function decodeEntry(record) {
  const entry = record.entry?.Present?.entry;
  return decode(entry);
}
export function timestampToMillis(timestamp) {
  return Math.floor(timestamp / 1000);
}

export function encodeHashToBase64(hash) {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

export type HolochainRecord = {
  signed_action: any;
  entry: any;
};

export class EntryRecord<T> {
  record: { signed_action: any, entry: any };
  constructor(record) {
      this.record = record;
  }
  get actionHash() {
      return this.record.signed_action.hashed.hash;
  }
  get action() {
      const action = this.record.signed_action.hashed.content;
      return {
          ...action,
          timestamp: timestampToMillis(action.timestamp),
      };
  }
  get entry() {
      return decodeEntry(this.record);
  }
  get entryHash() {
      return this.record.signed_action.hashed.content.entry_hash;
  }
}

export const extractEdges = <T>(withEdges: { edges: { node: T }[] }): T[] => {
  if (!withEdges?.edges || !withEdges.edges.length) {
    return [];
  }
  return withEdges.edges.map(({ node }) => node);
};

export const createEdges = <T>(nodes: T[]): { edges: { node: T }[] } => {
  const edges = nodes.map((node) => ({ node, cursor: null }));
  return { edges };
};

export function serializeAsyncActions<T>(actions: Array<() => Promise<T>>) {
  let actionFiber = Promise.resolve({}) as Promise<T>;
  actionFiber = actions.reduce(
    (chain: Promise<T>, curr) => chain.then(curr),
    actionFiber,
  );
}

export async function fetchWinDataForOrbit(
  client: ApolloClient<any>,
  orbitEh: EntryHashB64,
  date: DateTime
) {
  const yearDotMonth = toYearDotMonth(date.toLocaleString());
  const { data } = await client.query({
    fetchPolicy: 'network-only',
    query: GetWinRecordForOrbitForMonthDocument,
    variables: {
      params: {
        yearDotMonth,
        orbitEh,
      }
    }
  });

  if (data?.getWinRecordForOrbitForMonth) {
    return data.getWinRecordForOrbitForMonth.winData.reduce(
      winDataArrayToWinRecord,
      {}
    );
  }

  return null;
}