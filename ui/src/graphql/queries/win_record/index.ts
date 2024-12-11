import { mapZomeFn } from "../../connection";
import { DNAIdMappings, ById } from "../../types";
import {
  HAPP_DNA_NAME,
  HAPP_ZOME_NAME_PERSONAL_HABITS,
} from "../../../constants";
import { Maybe, WinDateEntry, WinRecord } from "../../generated";

import { EntryRecord, encodeHashToBase64, HolochainRecord } from "../../utils";
import { EntryHashB64 } from "@state/types";

type QueryParams = {
  orbitEh: EntryHashB64;
  yearDotMonth: string;
};

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const read = mapZomeFn<QueryParams, HolochainRecord>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "get_an_orbits_win_record_for_month"
  );

  return {
    getWinRecordForOrbitForMonth: async (
      _,
      args
    ): Promise<Maybe<WinRecord>> => {
      let rawRecords;
      try {
        rawRecords = await read(args.params);
      } catch (error) {
        console.error(
          "Couldn't fetch win records for orbit for month :>> ",
          error
        );
      }
      const entryRecords = rawRecords.map(
        (record) => new EntryRecord<WinRecord>(record as any)
      );
      if (entryRecords.length > 0) {
        return {
          winData: Object.entries(entryRecords[0].entry.winData).map(
            ([date, value]) => ({ date, value })
          ) as WinDateEntry[],
          orbitId: args.params.orbitEh,
          id: entryRecords[0].actionHash,
          eH: encodeHashToBase64(entryRecords[0].entryHash),
        };
      } else {
        return null;
      }
    },
  };
};
