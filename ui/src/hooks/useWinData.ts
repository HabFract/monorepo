import React, { useCallback, useEffect, useMemo, useRef } from "react";
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
import { EntryHashB64 } from "@holochain/client";

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
  const currentYearDotMonth = useMemo(
    () => toYearDotMonth(currentDate.toLocaleString()),
    [currentDate]
  );

  const orbitHashRef = useRef<string | null>(null);
  const winDataRef = useRef<WinDataPerOrbitNode | null>(null);
  orbitHashRef.current = currentOrbitDetails?.id ?? null;

  const skipFlag = !currentOrbitDetails || !currentOrbitDetails.eH;
  // Get the hierarchy state
  const appState = useAtomValue(appStateAtom);

  const hierarchyData = useMemo(() => {
    if (!orbitHashRef.current) return null;
    return Object.values(appState.hierarchies.byRootOrbitEntryHash).find((h) =>
      h.nodeHashes.includes(orbitHashRef.current!)
    );
  }, [appState.hierarchies.byRootOrbitEntryHash]);

  const isHierarchyLoaded = useMemo(() => {
    return (
      hierarchyData?.json &&
      hierarchyData.json !== "" &&
      hierarchyData.nodeHashes?.length > 1
    );
  }, [hierarchyData]);

  // Memoize isLeaf atom to prevent recreation
  const isLeafAtom = useMemo(
    () => isLeafNodeHashAtom(currentOrbitDetails?.id || ""),
    [currentOrbitDetails?.id]
  );
  const isLeaf = useAtomValue(isLeafAtom);

  const numberOfLeafOrbitDescendants = useMemo(() => {
    if (!isHierarchyLoaded || !hierarchyData || !currentOrbitDetails?.eH) return null;
    
    try {
      const tree = JSON.parse(hierarchyData.json)[0];
      const d3Hierarchy = hierarchy(tree);
      const currentNode = d3Hierarchy.find(
        (node) => node.data.content === currentOrbitDetails.eH
      );
      return currentNode ? currentNode.leaves().length : null;
    } catch (e) {
      console.error('Error calculating leaf descendants:', e);
      return null;
    }
  }, [isHierarchyLoaded, hierarchyData, currentOrbitDetails?.eH]);

  // Used to read windata conditionally for leaf/non leaf conditions
  const winDataAtom = useMemo(() => {
    if (!orbitHashRef.current || !isHierarchyLoaded) {
      return atom<WinDataPerOrbitNode | null>(null);
    }
    if (!isLeaf) {
      return calculateWinDataForNonLeafNodeAtom(currentOrbitDetails?.eH as EntryHashB64);
    }

    return winDataPerOrbitNodeAtom(orbitHashRef.current);
  }, [currentOrbitDetails, isLeaf, isHierarchyLoaded]);

  const workingWinDataForOrbit = store.get(winDataAtom);
  winDataRef.current = workingWinDataForOrbit;

  // Only fetch and process win records for leaf nodes
  const [getWinRecord, { data, error, loading }] = useGetWinRecordForOrbitForMonthLazyQuery({
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  /* Cleanup effect */
  useEffect(() => {
    return () => {
      orbitHashRef.current = null;
      winDataRef.current = null;
    };
  }, []);

  /* Handles fetching windata query result for current orbit */
  useEffect(() => {
    let isMounted = true;

    const fetchWinData = async () => {
      if (
        !orbitHashRef.current ||
        skipFlag ||
        !isLeaf ||
        !isHierarchyLoaded ||
        winDataRef.current
      ) return;

      try {
        const result = await getWinRecord({
          variables: {
            params: {
              yearDotMonth: currentYearDotMonth,
              orbitEh: currentOrbitDetails?.eH,
            },
          },
        });

        if (!isMounted) return;

        if (result.data?.getWinRecordForOrbitForMonth) {
          const newWinData = result.data.getWinRecordForOrbitForMonth.winData
            .reduce(winDataArrayToWinRecord, {});
          store.set(winDataPerOrbitNodeAtom(orbitHashRef.current), newWinData);
        }
      } catch (error) {
        console.error('Error fetching win data:', error);
      }
    };

    fetchWinData();

    return () => {
      isMounted = false;
    };
  }, [currentYearDotMonth, isLeaf, isHierarchyLoaded, skipFlag, currentOrbitDetails?.eH]);


  /* Handles updating appState with graphql query result for orbit's winrecord */
  useEffect(() => {
    if (!currentOrbitDetails || !data?.getWinRecordForOrbitForMonth || !isLeaf)
      return;

    const newWinData = data.getWinRecordForOrbitForMonth.winData.reduce(
      winDataArrayToWinRecord,
      {}
    );
    store.set(winDataPerOrbitNodeAtom(currentOrbitDetails?.id), newWinData);
  }, [data, isLeaf, currentOrbitDetails, orbitHashRef.current]);

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
  const handleUpdateWorkingWins = useCallback((newWinCount: number) => {
    if (!winDataRef.current || !currentOrbitDetails || !isLeaf) return;

    const updatedData = {
      ...winDataRef.current,
      [currentDate.toLocaleString()]:
        currentOrbitDetails.frequency > 1
          ? Array(currentOrbitDetails.frequency)
              .fill(false)
              .map((_, i) => i < newWinCount)
          : !!newWinCount,
    } as WinDataPerOrbitNode;

    store.set(winDataPerOrbitNodeAtom(currentOrbitDetails.id), updatedData);
  }, [currentDate, currentOrbitDetails, isLeaf]);

  /* Graphql mutation for persisting wins */
  const createOrUpdateWinRecord = useCreateOrUpdateWinRecord({
    variables: { winRecord: { orbitEh: currentOrbitDetails?.eH } },
  });

  /* Callback which can be passed to UI components to trigger above mutation */
    const handlePersistWins = useCallback(() => {
    if (!createOrUpdateWinRecord || skipFlag || !currentOrbitDetails?.eH) return;

    if (isLeaf && winDataRef.current) {
      createOrUpdateWinRecord({
        variables: {
          winRecord: {
            orbitEh: currentOrbitDetails.eH,
            winData: Object.entries(winDataRef.current).map(([date, value]) => ({
              date,
              ...(isMoreThenDaily(currentOrbitDetails.frequency || 0)
                ? { multiple: value }
                : { single: value }),
            })),
          },
        },
      });
    }
  }, [createOrUpdateWinRecord, skipFlag, currentOrbitDetails, isLeaf]);
  return {
    workingWinDataForOrbit,
    handleUpdateWorkingWins,
    handlePersistWins,
    isLeaf,
    numberOfLeafOrbitDescendants,
  };
}
