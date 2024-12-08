import { ApolloClient } from "@apollo/client";
import { EntryHashB64 } from "@holochain/client";
import { toYearDotMonth } from "habit-fract-design-system";
import { DateTime } from "luxon";
import { GetWinRecordForOrbitForMonthDocument } from "./generated";
import { winDataArrayToWinRecord } from "../hooks/useWinData";

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