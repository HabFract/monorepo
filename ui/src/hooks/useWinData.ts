import React, { useCallback, useEffect, useMemo } from "react";
import { OrbitNodeDetails, WinDataPerOrbitNode } from "../state/types";
import { useGetWinRecordForOrbitForMonthLazyQuery } from "../graphql/generated";
import { toYearDotMonth } from "habit-fract-design-system";
import { DateTime } from "luxon";
import { Atom, atom, useAtomValue, WritableAtom } from "jotai";
import {
  calculateWinDataForNonLeafNodeAtom,
  winDataPerOrbitNodeAtom,
} from "../state/win";
import { appStateAtom, isLeafNodeHashAtom, store } from "../state";
import { hierarchy } from "d3-hierarchy";
import { isMoreThenDaily } from "../components/vis/tree-helpers";
import { useCreateOrUpdateWinRecord } from "./gql/useCreateOrUpdateWinRecord";

/* Helper to remember which read atom to use for leaf/non leaf nodes' win records */
export function useMemoizedAtom<T, W = T>(
  key: string,
  createAtom: () => WritableAtom<T, [T], void> | Atom<T>,
  deps: any[]
): WritableAtom<T, [T], void> | Atom<T> {
  return useMemo(() => {
    const cachedAtom = (window as any).__ATOM_CACHE__?.[key];
    if (cachedAtom) {
      return cachedAtom;
    }

    const newAtom = createAtom();
    if (!(window as any).__ATOM_CACHE__) {
      (window as any).__ATOM_CACHE__ = {};
    }
    (window as any).__ATOM_CACHE__[key] = newAtom;
    return newAtom;
  }, deps);
}

/* Helper to transform fetched winData to a win records */
export const winDataArrayToWinRecord = (
  acc: any,
  { date, value: val }: any
) => {
  acc[date] = "single" in val ? val.single : val.multiple;
  return acc;
};

/**
 * Custom hook to manage win data fetching and caching for both leaf and non-leaf orbit nodes.
 *
 * @param {OrbitNodeDetails | null} currentOrbitDetails - The details of the current orbit
 * @param {DateTime} currentDate - The current date for which win data is being managed
 * @returns {Object} An object containing:
 *   - `workingWinDataForOrbit`: The current win data for the orbit (actual for leaf nodes, calculated for non-leaf nodes)
 *   - `handleUpdateWorkingWins`: A function to update the win count for the current date (only for leaf nodes)
 *   - `handlePersistWins`: A function to persist the win record on the source chain
 *   - `isLeaf`: Boolean indicating whether the current orbit is a leaf node
 *   - `numberOfLeafOrbitDescendants`: Number indicating how many potential leaf node descendants could be completed
 *
 * @example
 * const { workingWinDataForOrbit, handleUpdateWorkingWins, isLeaf } = useWinData(currentOrbitDetails, currentDate);
 *
 * @description
 * This hook handles different behaviors for leaf and non-leaf nodes:
 * - Leaf nodes: Manages actual win data with fetching, updating, and persistence
 * - Non-leaf nodes: Provides calculated win data based on descendant completion status
 * The hook ensures that win data is correctly initialized and updated based on the orbit's type and frequency.
 */
export function useWinData(
  currentOrbitDetails: OrbitNodeDetails | null,
  currentDate: DateTime
) {
  const currentYearDotMonth = toYearDotMonth(currentDate.toLocaleString());
  const skipFlag = !currentOrbitDetails || !currentOrbitDetails.eH;
  const orbitHash = currentOrbitDetails?.id;

  // Get the hierarchy state
  const appState = useAtomValue(appStateAtom);

  const hierarchyData = useMemo(() => {
    const hierarchy = Object.values(
      appState.hierarchies.byRootOrbitEntryHash
    ).find((h) => h.nodeHashes.includes(orbitHash!));

    return hierarchy;
  }, [appState.hierarchies.byRootOrbitEntryHash, orbitHash]);

  // Track if hierarchy is properly loaded
  const isHierarchyLoaded = useMemo(() => {
    return (
      hierarchyData?.json &&
      hierarchyData.json !== "" &&
      hierarchyData.nodeHashes?.length > 1
    );
  }, [hierarchyData]);

  const isLeaf = useAtomValue(
    useMemo(
      () => isLeafNodeHashAtom(currentOrbitDetails?.id || ""),
      [currentOrbitDetails?.id]
    )
  );

  const numberOfLeafOrbitDescendants: number | null = useMemo(() => {
    if (!isHierarchyLoaded) return null;
    const tree = JSON.parse(hierarchyData!.json)[0];
    const d3Hierarchy = hierarchy(tree);
    const currentNode = d3Hierarchy.find(
      (node) => node.data.content == currentOrbitDetails?.eH
    );
    if (!currentNode) return null;

    return currentNode.leaves().length;
  }, [isHierarchyLoaded, currentOrbitDetails, currentDate]);

  // Used to read windata conditionally for leaf/non leaf conditions
  const winDataAtom = useMemoizedAtom(
    `winData-${orbitHash}-${isLeaf}`,
    () => {
      if (!orbitHash || !isHierarchyLoaded) {
        return atom<WinDataPerOrbitNode | null>(null);
      }
      if (!isLeaf) {
        return calculateWinDataForNonLeafNodeAtom(currentOrbitDetails?.eH);
      }

      return winDataPerOrbitNodeAtom(orbitHash);
    },
    [currentOrbitDetails, isLeaf, isHierarchyLoaded]
  );
  const workingWinDataForOrbit = store.get(winDataAtom);

  // Only fetch and process win records for leaf nodes
  const [getWinRecord, { data, loading, error }] =
    useGetWinRecordForOrbitForMonthLazyQuery();

  /* Handles fetching windata query result for current orbit */
  useEffect(() => {
    if (
      !orbitHash ||
      skipFlag ||
      !isLeaf ||
      !isHierarchyLoaded ||
      workingWinDataForOrbit
    )
      return;

    getWinRecord({
      variables: {
        params: {
          yearDotMonth: currentYearDotMonth,
          orbitEh: currentOrbitDetails?.eH,
        },
      },
    });
  }, [
    orbitHash,
    skipFlag,
    isLeaf,
    isHierarchyLoaded,
    workingWinDataForOrbit,
    currentYearDotMonth,
    getWinRecord,
  ]);

  /* Handles updating appState with graphql query result for orbit's winrecord */
  useEffect(() => {
    if (!currentOrbitDetails || !data?.getWinRecordForOrbitForMonth || !isLeaf)
      return;

    const newWinData = data.getWinRecordForOrbitForMonth.winData.reduce(
      winDataArrayToWinRecord,
      {}
    );
    store.set(winDataPerOrbitNodeAtom(currentOrbitDetails?.id), newWinData);
  }, [data, isLeaf, currentOrbitDetails, orbitHash]);

  /* Handles initializing appState for orbits without persisted winrecord */
  useEffect(() => {
    if (
      loading ||
      !currentOrbitDetails ||
      !currentDate ||
      (!data && !error) ||
      (data?.getWinRecordForOrbitForMonth?.winData?.length &&
        data?.getWinRecordForOrbitForMonth?.winData.length > 0) ||
      !isLeaf ||
      workingWinDataForOrbit?.[currentDate.toLocaleString()]
    )
      return;
    // console.log("Initializing win data for leaf:", {
    //   orbitHash,
    //   date: currentDate.toLocaleString(),
    //   frequency: currentOrbitDetails.frequency,
    //   isArray: currentOrbitDetails.frequency > 1,
    // });

    const newData = {
      ...((workingWinDataForOrbit as any) || {}),
      [currentDate.toLocaleString()]:
        currentOrbitDetails.frequency > 1
          ? new Array(currentOrbitDetails.frequency).fill(false)
          : false, // Boolean for frequency <= 1
    } as WinDataPerOrbitNode;

    store.set(winDataPerOrbitNodeAtom(currentOrbitDetails?.id), newData);
  }, [data, currentDate, loading, error, isLeaf, currentOrbitDetails]);

  /* Callback which can be passed to UI components to trigger updating AppState*/
  const handleUpdateWorkingWins = useCallback(
    (newWinCount: number) => {
      if (!workingWinDataForOrbit || !currentOrbitDetails || !isLeaf) return;
      const updatedData = {
        ...workingWinDataForOrbit,
        [currentDate.toLocaleString()]:
          currentOrbitDetails.frequency > 1
            ? Array(currentOrbitDetails.frequency)
                .fill(false)
                .map((_, i) => i < newWinCount)
            : !!newWinCount,
      } as WinDataPerOrbitNode;
      store.set(winDataPerOrbitNodeAtom(currentOrbitDetails?.id), updatedData);
    },
    [
      workingWinDataForOrbit,
      currentOrbitDetails,
      currentDate,
      isLeaf,
      orbitHash,
    ]
  );

  /* Graphql mutation for persisting wins */
  const createOrUpdateWinRecord = useCreateOrUpdateWinRecord({
    variables: { winRecord: { orbitEh: currentOrbitDetails?.eH } },
  });

  /* Callback which can be passed to UI components to trigger above mutation */
  const handlePersistWins = useCallback(() => {
    if (typeof createOrUpdateWinRecord !== "function") return;
    if (skipFlag) {
      console.error("Not enough details to persist.");
      return;
    }

    console.log("Persisting new win data...");
    if (isLeaf) {
      createOrUpdateWinRecord({
        variables: {
          winRecord: {
            orbitEh: currentOrbitDetails?.eH,
            winData:
              store.get(winDataAtom) !== null &&
              Object.entries(store.get(winDataAtom)!).map(([date, value]) => ({
                date,
                ...(isMoreThenDaily(currentOrbitDetails?.frequency || 0)
                  ? { multiple: value }
                  : { single: value }),
              })),
          },
        },
        skip: skipFlag,
      });
      // console.log("updated win appstate for orbit :>> ", {
      //   orbitHash: currentOrbitDetails?.eH,
      //   date: currentDate,
      //   winData: store.get(winDataAtom),
      // });
    } else {
      console.log(
        "Current orbit is not a leaf. Wins will be calculated from child nodes."
      );
    }
  }, [currentOrbitDetails, workingWinDataForOrbit, createOrUpdateWinRecord]);

  return {
    workingWinDataForOrbit,
    handleUpdateWorkingWins,
    handlePersistWins,
    isLeaf,
    numberOfLeafOrbitDescendants,
  };
}
