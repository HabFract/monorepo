import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  WinData,
  Frequency,
  OrbitNodeDetails,
  FixedLengthArray,
  WinDataPerOrbitNode,
} from "../state/types";
import {
  useGetWinRecordForOrbitForMonthLazyQuery,
  useGetWinRecordForOrbitForMonthQuery,
} from "../graphql/generated";
import { EntryHashB64 } from "@holochain/client";
import { toYearDotMonth } from "habit-fract-design-system";
import { isMoreThenDaily } from "../components/vis/tree-helpers";
import { DateTime } from "luxon";
import { atom, useAtom, useAtomValue, WritableAtom } from "jotai";
import {
  calculateWinDataForNonLeafNodeAtom,
  winDataPerOrbitNodeAtom,
} from "../state/win";
import { appStateAtom, isLeafNodeHashAtom, store } from "../state";

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
 *   - `isLeaf`: Boolean indicating whether the current orbit is a leaf node
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
  const orbitHash = currentOrbitDetails?.id as EntryHashB64;

  // Get the hierarchy state
  const appState = useAtomValue(appStateAtom);
  const hierarchyData = useMemo(() => {
    const hierarchy = Object.values(
      appState.hierarchies.byRootOrbitEntryHash
    ).find((h) => h.nodeHashes.includes(orbitHash));
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

  const winDataAtom = useMemo(() => {
    if (!orbitHash || !isHierarchyLoaded) {
      console.log("No orbit hash or hierarchy not loaded, returning null atom");
      return atom<WinDataPerOrbitNode | null>(null);
    }

    if (!isLeaf) {
      // Non-leaf nodes always use arrays for partial completion
      const calculatedAtom = calculateWinDataForNonLeafNodeAtom(
        currentOrbitDetails?.eH
      );
      return calculatedAtom as WritableAtom<
        WinDataPerOrbitNode | null,
        [SetStateAction<WinDataPerOrbitNode | null>],
        void
      >;
    }

    // Leaf nodes use regular win data atom
    return winDataPerOrbitNodeAtom(orbitHash);
  }, [orbitHash, isLeaf, isHierarchyLoaded, currentOrbitDetails]);

  // Explicitly type the atom and its setter
  const [workingWinDataForOrbit, setWorkingWinDataForOrbit] = useAtom<
    WinDataPerOrbitNode | null,
    [SetStateAction<WinDataPerOrbitNode | null>],
    void
  >(winDataAtom as any);

  // Only fetch and process win records for leaf nodes
  const [getWinRecord, { data, loading, error }] =
    useGetWinRecordForOrbitForMonthLazyQuery();

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
          orbitEh: orbitHash,
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
  ]);

  useEffect(() => {
    if (!currentOrbitDetails || !data?.getWinRecordForOrbitForMonth || !isLeaf)
      return;

    const newWinData = data.getWinRecordForOrbitForMonth.winData.reduce(
      winDataArrayToWinRecord,
      {}
    );
    setWorkingWinDataForOrbit(newWinData);
  }, [data, isLeaf, currentOrbitDetails]);

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

    console.log("Initializing win data for leaf:", {
      orbitHash,
      date: currentDate.toLocaleString(),
      frequency: currentOrbitDetails.frequency,
      isArray: currentOrbitDetails.frequency > 1,
    });

    const newData = {
      ...((workingWinDataForOrbit as any) || {}),
      [currentDate.toLocaleString()]:
        currentOrbitDetails.frequency > 1
          ? new Array(currentOrbitDetails.frequency).fill(false)
          : false, // Boolean for frequency <= 1
    } as WinDataPerOrbitNode;

    setWorkingWinDataForOrbit(newData);
  }, [data, currentDate, loading, error, isLeaf, currentOrbitDetails]);

  const handleUpdateWorkingWins = useCallback(
    (newWinCount: number) => {
      if (!workingWinDataForOrbit || !currentOrbitDetails || !isLeaf) return;

      console.log("Updating wins for leaf:", {
        orbitHash,
        date: currentDate.toLocaleString(),
        newWinCount,
        frequency: currentOrbitDetails.frequency,
        isArray: currentOrbitDetails.frequency > 1,
      });

      const updatedData = {
        ...workingWinDataForOrbit,
        [currentDate.toLocaleString()]:
          currentOrbitDetails.frequency > 1
            ? Array(currentOrbitDetails.frequency)
                .fill(false)
                .map((_, i) => i < newWinCount)
            : !!newWinCount, // Boolean for frequency <= 1
      } as WinDataPerOrbitNode;

      setWorkingWinDataForOrbit(updatedData);
    },
    [workingWinDataForOrbit, currentOrbitDetails, currentDate, isLeaf]
  );

  return {
    workingWinDataForOrbit,
    handleUpdateWorkingWins,
    isLeaf,
  };
}
