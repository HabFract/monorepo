import { mapZomeFn } from "../../connection";
import { DNAIdMappings, ById } from "../../types";
import {
  HAPP_DNA_NAME,
  HAPP_ZOME_NAME_PERSONAL_HABITS,
} from "../../../constants";
import { Maybe, WinRecord } from "../../generated";
import { EntryRecord } from "@holochain-open-dev/utils";
import {
  ActionHashB64,
  encodeHashToBase64,
  EntryHashB64,
  Record as HolochainRecord,
} from "@holochain/client";

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
          winData: entryRecords[0].entry,
          orbitId: args.orbitEh,
          id: encodeHashToBase64(entryRecords[0].actionHash),
          eH: encodeHashToBase64(entryRecords[0].entryHash),
        };
      } else {
        return null;
      }
    },
  };
};
