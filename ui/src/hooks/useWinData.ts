import React, { useCallback, useEffect, useState } from "react";
import {
  WinData,
  Frequency,
  OrbitNodeDetails,
  FixedLengthArray,
} from "../state/types";
import { useGetWinRecordForOrbitForMonthQuery } from "../graphql/generated";
import { EntryHashB64 } from "@holochain/client";
import { toYearDotMonth } from "habit-fract-design-system";
import { isMoreThenDaily } from "../components/vis/tree-helpers";
import { DateTime } from "luxon";

export const winDataArrayToWinRecord = (
  acc: any,
  { date, value: val }: any
) => {
  acc[date] = "single" in val ? val.single : val.multiple;
  return acc;
};

/**
 * Custom hook to manage win data for a specific orbit and date.
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
  const [workingWinDataForOrbit, setWorkingWinDataForOrbit] =
    useState<WinData<Frequency.Rationals> | null>(null);
  const currentYearDotMonth = toYearDotMonth(currentDate.toLocaleString());
  const skipFlag = !currentOrbitDetails || !currentOrbitDetails.eH;

  const { data, refetch } = useGetWinRecordForOrbitForMonthQuery({
    variables: {
      params: {
        yearDotMonth: currentYearDotMonth,
        orbitEh: currentOrbitDetails?.eH as EntryHashB64,
      },
    },
    skip: skipFlag,
  });

  useEffect(() => {
    if (!currentOrbitDetails) return;
    setWorkingWinDataForOrbit(null);
    if (!skipFlag) {
      refetch();
    }
  }, [currentOrbitDetails?.eH]);

  useEffect(() => {
    if (currentOrbitDetails == null || !data?.getWinRecordForOrbitForMonth)
      return;
    console.log(
      "data.getWinRecordForOrbitForMonth.winData :>> ",
      data.getWinRecordForOrbitForMonth.winData
    );
    const newWinData = data.getWinRecordForOrbitForMonth.winData.reduce(
      winDataArrayToWinRecord,
      {}
    );
    setWorkingWinDataForOrbit(newWinData);
  }, [data]);

  useEffect(() => {
    if (currentOrbitDetails == null || !currentDate) return;

    setWorkingWinDataForOrbit((prevData) => {
      if (!prevData || !(currentDate.toLocaleString() in prevData)) {
        return {
          ...prevData,
          [currentDate.toLocaleString()]: isMoreThenDaily(
            currentOrbitDetails.frequency
          )
            ? (new Array(currentOrbitDetails.frequency).fill(
                false
              ) as FixedLengthArray<
                boolean,
                typeof currentOrbitDetails.frequency
              >)
            : (false as any),
        };
      }
      return prevData;
    });
  }, [currentDate, currentOrbitDetails]);

  const handleUpdateWorkingWins = useCallback(
    (newWinCount: number) => {
      if (workingWinDataForOrbit == null || currentOrbitDetails == null) return;

      setWorkingWinDataForOrbit((prevData) => ({
        ...prevData,
        [currentDate.toLocaleString()]:
          currentOrbitDetails.frequency > 1
            ? Array(currentOrbitDetails.frequency)
                .fill(false)
                .map((_, i) => i < newWinCount)
            : !!newWinCount,
      }));
    },
    [workingWinDataForOrbit, currentOrbitDetails, currentDate]
  );

  return { workingWinDataForOrbit, handleUpdateWorkingWins };
}
