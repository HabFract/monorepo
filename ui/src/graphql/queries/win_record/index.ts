import { mapZomeFn } from "../../connection";
import { DNAIdMappings, ById } from "../../types";
import {
  HAPP_DNA_NAME,
  HAPP_ZOME_NAME_PERSONAL_HABITS,
} from "../../../constants";
import { WinRecord } from "../../generated";
import { EntryRecord } from "@holochain-open-dev/utils";
import {
  ActionHashB64,
  encodeHashToBase64,
  Record as HolochainRecord,
} from "@holochain/client";

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const read = mapZomeFn<ById, HolochainRecord>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "get_win_record",
  );

  return {
    winRecord: async (_, args): Promise<WinRecord & { id: ActionHashB64}> => {
      const rawRecord = await read(args.id);
      const entryRecord = new EntryRecord<WinRecord>(rawRecord as any);
      // debugger;
      return {
        ...entryRecord.entry,
        id: encodeHashToBase64(entryRecord.actionHash),
        eH: encodeHashToBase64(entryRecord.entryHash),
      };
    },
  };
};
