import { NODE_ENV } from "./../constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import {
  NodeContent,
  OrbitNodeDetails,
  WinDataPerOrbitNode,
} from "../state/types";
import { useCreateOrUpdateWinRecord } from "./gql/useCreateOrUpdateWinRecord";
import { fetchWinDataForOrbit } from "../graphql/utils";
import { client as gql } from "../graphql/client";
import { HierarchyNode } from "d3-hierarchy";
import { useWinDataCache } from "../contexts/windata";
import { useMemo } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}
/**
 * Custom hook to manage win data fetching and state management for both leaf and non-leaf orbit nodes.
 * This hook handles the fetching, caching, and aggregation of win data while maintaining proper cleanup
 * and memory management.
 *
 * @param {OrbitNodeDetails | null} currentOrbitDetails - The details of the current orbit node
 * @param {DateTime} currentDate - The current date for which win data is being managed
 * @param {boolean} isLeafNode - Boolean indicating whether the current orbit is a leaf node
 * @param {HierarchyNode<NodeContent>} rootHierarchy - The D3 hierarchy data structure containing the orbit tree
 *
 * @returns {Object} An object containing:
 *   - `workingWinDataForOrbit`: {WinDataPerOrbitNode | null} The current win data for the orbit
 *     - For leaf nodes: Direct win data from the source
 *     - For non-leaf nodes: Aggregated win data calculated from leaf descendants
 *
 *   - `handleUpdateWorkingWins`: {(newWinCount: number) => void} Function to update the win count
 *     for the current date (only active for leaf nodes)
 *
 *   - `handlePersistWins`: {() => void} Function to persist the win record to the source chain
 *     (only active for leaf nodes)
 *
 *   - `numberOfLeafOrbitDescendants`: {number | null} Number indicating how many leaf node
 *     descendants exist under this orbit node
 *
 *   - `isLeaf`: {boolean} Boolean indicating whether the current orbit is a leaf node
 *
 * @example
 * ```tsx
 * const {
 *   workingWinDataForOrbit,
 *   handleUpdateWorkingWins,
 *   handlePersistWins,
 *   numberOfLeafOrbitDescendants,
 *   isLeaf
 * } = useWinData(orbitDetails, currentDate, isLeafNode, rootHierarchy);
 * ```
 *
 * @remarks
 * - The hook manages its own loading and mounted states to prevent memory leaks
 * - For non-leaf nodes, win data is calculated by aggregating the completion status of all leaf descendants
 * - Updates are debounced and batched to prevent excessive re-renders
 * - Proper cleanup is performed when the component unmounts or when the orbit changes
 *
 * @see {@link WinDataPerOrbitNode} for the structure of win data
 * @see {@link OrbitNodeDetails} for the structure of orbit details
 */
export function useWinData(
  currentOrbitDetails: OrbitNodeDetails | null,
  currentDate: DateTime,
  isLeafNode: boolean,
  rootHierarchy: HierarchyNode<NodeContent>
) {
  const [state, setState] = useState<{
    winData: WinDataPerOrbitNode | null;
    leafDescendants: number | null;
  }>({
    winData: null,
    leafDescendants: null,
  });

  const debugLog = (...args: any[]) => {
    NODE_ENV == "development" && console.log("[useWinDataV2]", ...args);
  };
  const { getWinData, setWinData } = useWinDataCache();
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  const currentWinDataRef = useRef<WinDataPerOrbitNode | null>(null);
  const leafDescendantsRef = useRef<Array<{ content: string }>>([]);

  const createOrUpdateWinRecord = useCreateOrUpdateWinRecord({
    variables: { winRecord: { orbitEh: currentOrbitDetails?.eH } },
  });

  // Calculate streaks whenever win data changes
  const streakData = useMemo((): StreakData => {
    if (!currentWinDataRef.current) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const winData = currentWinDataRef.current;

    // Calculate current streak
    let currentStreak = 0;
    let date = DateTime.now();

    while (true) {
      const dateString = date.toFormat("dd/MM/yyyy");
      const winEntry = winData[dateString];

      if (winEntry === undefined) break;

      if (Array.isArray(winEntry)) {
        if (winEntry.every(Boolean)) {
          currentStreak++;
        } else {
          break;
        }
      } else if (winEntry === true) {
        currentStreak++;
      } else {
        break;
      }

      date = date.minus({ days: 1 });
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: DateTime | null = null;

    // Sort dates chronologically
    const sortedDates = Object.keys(winData).sort((a, b) => {
      const dateA = DateTime.fromFormat(a, "dd/MM/yyyy");
      const dateB = DateTime.fromFormat(b, "dd/MM/yyyy");
      return dateA.toMillis() - dateB.toMillis();
    });

    for (const date of sortedDates) {
      const winEntry = winData[date];
      const currentDate = DateTime.fromFormat(date, "dd/MM/yyyy");

      // Reset streak if dates aren't consecutive
      if (previousDate && currentDate.diff(previousDate, "days").days !== 1) {
        tempStreak = 0;
      }

      if (Array.isArray(winEntry)) {
        if (winEntry.every(Boolean)) {
          tempStreak++;
        } else {
          tempStreak = 0;
        }
      } else if (winEntry === true) {
        tempStreak++;
      } else {
        tempStreak = 0;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      previousDate = currentDate;
    }

    return { currentStreak, longestStreak };
  }, [currentWinDataRef.current]);

  // Check cache first when mounting
  useEffect(() => {
    if (currentOrbitDetails && !state.winData) {
      const cachedData = getWinData(currentOrbitDetails);
      if (cachedData) {
        setState((prev) => ({
          ...prev,
          winData: cachedData,
        }));
        currentWinDataRef.current = cachedData;
      }
    }
  }, [currentOrbitDetails]);

  const handleUpdateWorkingWins = useCallback(
    (newWinCount: number) => {
      if (!currentOrbitDetails?.id || !isLeafNode) return;

      const newValue =
        currentOrbitDetails.frequency > 1
          ? Array(currentOrbitDetails.frequency)
              .fill(false)
              .map((_, i) => i < newWinCount)
          : !!newWinCount;

      const updatedData = {
        ...(currentWinDataRef.current || {}),
        [currentDate.toLocaleString()]: newValue,
      };

      // Update local state and cache
      setState((prev) => ({
        ...prev,
        winData: updatedData,
      }));
      currentWinDataRef.current = updatedData;

      if (currentOrbitDetails) {
        setWinData(currentOrbitDetails, updatedData);
      }
    },
    [currentOrbitDetails, isLeafNode, currentDate, setWinData]
  );
  // Handle persisting wins to the source chain
  const handlePersistWins = useCallback(() => {
    if (!currentOrbitDetails?.eH || !isLeafNode || !currentWinDataRef.current) {
      debugLog("Cannot persist wins - invalid state");
      return;
    }

    debugLog("Persisting wins for orbit:", currentOrbitDetails.eH);

    createOrUpdateWinRecord({
      variables: {
        winRecord: {
          orbitEh: currentOrbitDetails.eH,
          winData: Object.entries(currentWinDataRef.current).map(
            ([date, value]) => ({
              date,
              ...(Array.isArray(value)
                ? { multiple: value }
                : { single: value }),
            })
          ),
        },
      },
    });
  }, [currentOrbitDetails?.eH, isLeafNode]);

  // Fetch initial data
  useEffect(() => {
    if (!currentOrbitDetails?.eH || loadingRef.current) return;

    const fetchData = async () => {
      debugLog("Fetching initial win data for orbit:", currentOrbitDetails.eH);
      loadingRef.current = true;

      try {
        if (isLeafNode) {
          const data = await fetchWinDataForOrbit(
            (await gql) as any,
            currentOrbitDetails.eH,
            currentDate
          );

          if (!mountedRef.current) return;

          if (data) {
            debugLog("Received win data:", data);
            setState((prev) => ({
              ...prev,
              winData: data,
            }));
            currentWinDataRef.current = data;
          }
        } else {
          // Calculate aggregated win data for non-leaf node
          const leaves =
            rootHierarchy
              .find((node) => node.data.content === currentOrbitDetails.eH)
              ?.leaves() || [];

          // Fetch win data for all leaf descendants
          const leafWinData = await Promise.all(
            leaves.map(async (leaf) => {
              const data = await fetchWinDataForOrbit(
                (await gql) as any,
                leaf.data.content,
                currentDate
              );
              return { content: leaf.data.content, winData: data };
            })
          );

          // Get all unique dates
          const allDates = new Set<string>();
          leafWinData.forEach(({ winData }) => {
            if (winData && typeof winData === "object") {
              Object.keys(winData).forEach((date) => allDates.add(date));
            }
          });

          // Create aggregated win data preserving individual completion states
          const aggregatedData = Array.from(allDates).reduce((acc, date) => {
            // Map each leaf node's completion state for this date
            const completionStates = leafWinData.map(({ winData }) => {
              const dayData = winData?.[date];
              return Array.isArray(dayData)
                ? dayData.every(Boolean) // If it's an array, check if all true
                : !!dayData; // If it's a single value, convert to boolean
            });

            acc[date] = completionStates;
            return acc;
          }, {} as WinDataPerOrbitNode);

          debugLog("Calculated non-leaf win data:", {
            leaves: leaves.length,
            leafWinData,
            aggregatedData,
          });

          if (!mountedRef.current) return;

          setState((prev) => ({
            ...prev,
            winData: aggregatedData,
          }));
          currentWinDataRef.current = aggregatedData;

          // Cache the calculated data
          if (currentOrbitDetails) {
            setWinData(currentOrbitDetails, aggregatedData);
          }
        }
      } catch (error) {
        console.error("Error fetching win data:", error);
      } finally {
        loadingRef.current = false;
      }
    };

    fetchData();
  }, [currentOrbitDetails?.eH, currentDate.toISO(), isLeafNode]);

  // Calculate leaf descendants
  useEffect(() => {
    if (!rootHierarchy || !currentOrbitDetails?.eH) return;

    try {
      const currentNode = rootHierarchy.find(
        (node) => node.data.content === currentOrbitDetails.eH
      );

      if (currentNode) {
        const leaves = currentNode.leaves();
        leafDescendantsRef.current = leaves.map((node) => ({
          content: node.data.content,
        }));
        setState((prev) => ({
          ...prev,
          leafDescendants: leaves.length,
        }));
        debugLog("Calculated leaf descendants:", leaves.length);
      }
    } catch (e) {
      console.error("Error calculating leaf descendants:", e);
    }
  }, [rootHierarchy, currentOrbitDetails?.eH]);

  // Cleanup
  useEffect(() => {
    return () => {
      debugLog("Cleaning up win data hook");
      mountedRef.current = false;
      currentWinDataRef.current = null;
      setState({
        winData: null,
        leafDescendants: null,
      });
    };
  }, []);

  return {
    workingWinDataForOrbit: state.winData,
    handleUpdateWorkingWins,
    handlePersistWins,
    numberOfLeafOrbitDescendants: state.leafDescendants,
    isLeaf: isLeafNode,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
  };
}
