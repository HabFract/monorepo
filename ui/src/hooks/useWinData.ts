import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { OrbitNodeDetails, WinDataPerOrbitNode } from "../state/types";
import { DateTime } from "luxon";
import { atom, useAtom, useAtomValue } from "jotai";
import { appStateAtom, isLeafNodeHashAtom } from "../state";
import { hierarchy } from "d3-hierarchy";
import { isMoreThenDaily } from "../components/vis/tree-helpers";
import { useCreateOrUpdateWinRecord } from "./gql/useCreateOrUpdateWinRecord";
import { fetchWinDataForOrbit } from "../graphql/utils";
import { client as gql } from "..//graphql/client";
import { useWinDataState } from "../contexts/windata";
import { debounce } from "../components/vis/helpers";
import {
  calculateWinDataForNonLeafNodeAtom,
  winDataPerOrbitNodeAtom,
} from "@state/win";

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
 */
export function useWinData(
  currentOrbitDetails: OrbitNodeDetails | null,
  currentDate: DateTime
) {
  const appState = useAtomValue(appStateAtom);
  const subsRef = useRef<Array<() => void>>([]);
  const loadingRef = useRef(false);

  const orbitId = currentOrbitDetails?.id;

  // Create atoms
  const winDataAtom = useMemo(() => {
    return winDataPerOrbitNodeAtom(orbitId || 'placeholder');
  }, [orbitId]);

  const isLeafAtom = useMemo(
    () => isLeafNodeHashAtom(orbitId || 'placeholder'),
    [orbitId]
  );

  // Use atom values
  const isLeaf = useAtomValue(isLeafAtom);
  const [workingWinDataForOrbit, setWorkingWinData] = useAtom(winDataAtom);

  // Create a stable reference for the calculated win data atom
  const calculatedWinDataRef = useRef(atom<WinDataPerOrbitNode | null>(null));
  
  // Update the calculated win data
  useEffect(() => {
    if (!isLeaf && currentOrbitDetails?.eH) {
      calculatedWinDataRef.current = calculateWinDataForNonLeafNodeAtom(currentOrbitDetails.eH) as any;
    }
  }, [isLeaf, currentOrbitDetails?.eH]);

  // Use the calculated win data with proper null handling
  const nonLeafWinData = useAtomValue(calculatedWinDataRef.current);

  // Cleanup subscriptions
  useEffect(() => {
    return () => {
      subsRef.current.forEach((unsub) => unsub());
      subsRef.current = [];
    };
  }, []);

  // Fetch data for leaf nodes
  useEffect(() => {
    if (!currentOrbitDetails?.eH || loadingRef.current || !isLeaf) return;

    let mounted = true;
    loadingRef.current = true;

    const fetchData = async () => {
      try {
        const data = await fetchWinDataForOrbit(
          (await gql) as any,
          currentOrbitDetails.eH,
          currentDate
        );

        if (mounted && data) {
          setWorkingWinData(data);
        }
      } finally {
        loadingRef.current = false;
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [currentOrbitDetails?.eH, currentDate.toISO(), isLeaf, winDataAtom]);

  // Initialize win data for leaf nodes
  // Initialize win data with proper guards
  useEffect(() => {
    if (
      !currentOrbitDetails?.id ||
      !currentDate ||
      !isLeaf ||
      workingWinDataForOrbit?.[currentDate.toLocaleString()]
    ) return;

    const newData = {
      ...(workingWinDataForOrbit || {}),
      [currentDate.toLocaleString()]:
        currentOrbitDetails.frequency > 1
          ? new Array(currentOrbitDetails.frequency).fill(false)
          : false,
    } as WinDataPerOrbitNode;

    setWorkingWinData(newData);
  }, [currentOrbitDetails?.id, currentDate.toLocaleString(), isLeaf]);

  const handleUpdateWorkingWins = useCallback(
    (newWinCount: number) => {
      if (!currentOrbitDetails?.id || !isLeaf) return;

      const updatedData = {
        ...(workingWinDataForOrbit || {}),
        [currentDate.toLocaleString()]:
          currentOrbitDetails.frequency > 1
            ? Array(currentOrbitDetails.frequency)
                .fill(false)
                .map((_, i) => i < newWinCount)
            : !!newWinCount,
      };

      setWorkingWinData(updatedData);
    },
    [
      currentOrbitDetails,
      isLeaf,
      currentDate,
      winDataAtom,
      workingWinDataForOrbit,
    ]
  );
  const createOrUpdateWinRecord = useCreateOrUpdateWinRecord({
    variables: { winRecord: { orbitEh: currentOrbitDetails?.eH } },
  });
  const handlePersistWins = useCallback(() => {
    if (!currentOrbitDetails?.eH || !isLeaf || !workingWinDataForOrbit) return;

    createOrUpdateWinRecord({
      variables: {
        winRecord: {
          orbitEh: currentOrbitDetails.eH,
          winData: Object.entries(workingWinDataForOrbit).map(([date, value]) => ({
            date,
            ...(isMoreThenDaily(currentOrbitDetails.frequency || 0)
              ? { multiple: value }
              : { single: value }),
          })),
        },
      },
    });
  }, [currentOrbitDetails?.eH, isLeaf, workingWinDataForOrbit]);

  const hierarchyData = useMemo(() => {
    if (!orbitId) return null;
    return Object.values(appState.hierarchies.byRootOrbitEntryHash).find((h) =>
      h.nodeHashes.includes(orbitId!)
    );
  }, [appState.hierarchies.byRootOrbitEntryHash]);

  const isHierarchyLoaded = useMemo(() => {
    return (
      hierarchyData?.json &&
      hierarchyData.json !== "" &&
      hierarchyData.nodeHashes?.length > 1
    );
  }, [hierarchyData]);

  const numberOfLeafOrbitDescendants = useMemo(() => {
    if (!isHierarchyLoaded || !hierarchyData || !currentOrbitDetails?.eH)
      return null;

    try {
      const tree = JSON.parse(hierarchyData.json)[0];
      const d3Hierarchy = hierarchy(tree);
      const currentNode = d3Hierarchy.find(
        (node) => node.data.content === currentOrbitDetails.eH
      );
      return currentNode ? currentNode.leaves().length : null;
    } catch (e) {
      console.error("Error calculating leaf descendants:", e);
      return null;
    }
  }, [isHierarchyLoaded, hierarchyData, currentOrbitDetails?.eH]);


  return {
    workingWinDataForOrbit: isLeaf ? workingWinDataForOrbit : nonLeafWinData,
    handleUpdateWorkingWins: currentOrbitDetails?.id ? handleUpdateWorkingWins : undefined,
    handlePersistWins: currentOrbitDetails?.id ? handlePersistWins : undefined,
    numberOfLeafOrbitDescendants,
    isLeaf,
  };
}
