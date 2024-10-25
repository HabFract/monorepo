import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  WinData,
  Frequency,
  OrbitNodeDetails,
  FixedLengthArray,
} from "../state/types";
import {
  useGetWinRecordForOrbitForMonthLazyQuery,
  useGetWinRecordForOrbitForMonthQuery,
} from "../graphql/generated";
import { EntryHashB64 } from "@holochain/client";
import { toYearDotMonth } from "habit-fract-design-system";
import { isMoreThenDaily } from "../components/vis/tree-helpers";
import { DateTime } from "luxon";
import { useAtom } from "jotai";
import { winDataPerOrbitNodeAtom } from "../state/win";

export const winDataArrayToWinRecord = (
  acc: any,
  { date, value: val }: any
) => {
  acc[date] = "single" in val ? val.single : val.multiple;
  return acc;
};

/**
 * Custom hook to manage win data fetchin and caching for a specific orbit and date.
 *
 * @param {OrbitNodeDetails | null} currentOrbitDetails - The details of the current orbit.
 * @param {DateTime} currentDate - The current date for which win data is being managed.
 * @returns {Object} An object containing:
 *   - `workingWinDataForOrbit`: The current win data for the orbit.
 *   - `handleUpdateWorkingWins`: A function to update the win count for the current date.
 *
 * @example
 * const { workingWinDataForOrbit, handleUpdateWorkingWins } = useWinData(currentOrbitDetails, currentDate);
 *
 * @description
 * This hook handles the fetching, updating, and resetting of win data for a given orbit and date.
 * It ensures that the win data is correctly initialized and updated based on the orbit's frequency.
 */
export function useWinData(
  currentOrbitDetails: OrbitNodeDetails | null,
  currentDate: DateTime
) {
  const currentYearDotMonth = toYearDotMonth(currentDate.toLocaleString());
  const skipFlag = !currentOrbitDetails || !currentOrbitDetails.eH;
  const orbitHash = currentOrbitDetails?.eH as EntryHashB64;

  const [workingWinDataForOrbit, setWorkingWinDataForOrbit] = useAtom(
    useMemo(() => winDataPerOrbitNodeAtom(orbitHash), [orbitHash])
  );

  const [getWinRecord, { data, loading, error }] =
    useGetWinRecordForOrbitForMonthLazyQuery();

  useEffect(() => {
    if (!orbitHash) return;

    if (!skipFlag && !workingWinDataForOrbit) {
      console.log("VARIABLES", {
        variables: {
          params: {
            yearDotMonth: currentYearDotMonth,
            orbitEh: currentOrbitDetails?.eH as EntryHashB64,
          },
        },
      });
      getWinRecord({
        variables: {
          params: {
            yearDotMonth: currentYearDotMonth,
            orbitEh: currentOrbitDetails?.eH as EntryHashB64,
          },
        },
      });
    }
  }, [currentOrbitDetails?.eH, workingWinDataForOrbit]);

  useEffect(() => {
    if (currentOrbitDetails == null || !data?.getWinRecordForOrbitForMonth)
      return;

    const newWinData = data.getWinRecordForOrbitForMonth.winData.reduce(
      winDataArrayToWinRecord,
      {}
    );
    setWorkingWinDataForOrbit(newWinData);
  }, [data, orbitHash]);

  useEffect(() => {
    if (
      loading ||
      currentOrbitDetails == null ||
      !currentDate ||
      (!data && !error) ||
      (data?.getWinRecordForOrbitForMonth &&
        data.getWinRecordForOrbitForMonth.winData.length > 0)
    )
      return;

    if (
      !workingWinDataForOrbit ||
      !(currentDate.toLocaleString() in workingWinDataForOrbit)
    ) {
      const newData = {
        ...workingWinDataForOrbit,
        [currentDate.toLocaleString()]: isMoreThenDaily(
          currentOrbitDetails.frequency
        )
          ? (new Array(currentOrbitDetails.frequency).fill(
              false
            ) as FixedLengthArray<
              boolean,
              typeof currentOrbitDetails.frequency
            >)
          : false,
      } as any;
      console.log("newData :>> ", newData);
      setWorkingWinDataForOrbit(newData);
    }
  }, [data, currentDate, orbitHash]);

  const handleUpdateWorkingWins = useCallback(
    (newWinCount: number) => {
      if (workingWinDataForOrbit == null || currentOrbitDetails == null) return;

      const updatedData = {
        ...workingWinDataForOrbit,
        [currentDate.toLocaleString()]:
          currentOrbitDetails.frequency > 1
            ? Array(currentOrbitDetails.frequency)
                .fill(false)
                .map((_, i) => i < newWinCount)
            : !!newWinCount,
      } as any;
      setWorkingWinDataForOrbit(updatedData);
      console.log("updatedData :>> ", updatedData);
    },
    [
      workingWinDataForOrbit,
      currentOrbitDetails,
      currentDate,
      setWorkingWinDataForOrbit,
    ]
  );

  return { workingWinDataForOrbit, handleUpdateWorkingWins };
}
