import { mapZomeFn } from "../../connection";
import { DNAIdMappings } from "../../types";
import {
  HAPP_DNA_NAME,
  HAPP_ZOME_NAME_PERSONAL_HABITS,
} from "../../../constants";
import {
  WinRecord,
  WinRecordCreateParams,
  WinRecordUpdateParams,
} from "../../generated";
import { EntryRecord } from "@holochain-open-dev/utils";
import {
  Record as HolochainRecord,
} from "@holochain/client";

export type createHandler = (
  root: any,
  args: WinRecordCreateParams,
) => Promise<WinRecord>;
export type updateHandler = (
  root: any,
  args: WinRecordUpdateParams,
) => Promise<WinRecord>;

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<
    WinRecordCreateParams,
    HolochainRecord
  >(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "create_my_win_record",
  );
  const runUpdate = mapZomeFn<
    WinRecordUpdateParams,
    HolochainRecord
  >(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "update_win_record",
  );

  const createWinRecord: createHandler = async (
    _,
    { orbitId, winData },
  ) => {
    const rawRecord = await runCreate({
      orbitId, winData
    });
    const entryRecord = new EntryRecord<WinRecord>(rawRecord as any);
debugger;
    return {
      ...entryRecord.entry
    };
  };

  const updateWinRecord: updateHandler = async (
    _,
    { winRecordId, updatedWinRecord },
  ) => {
    const rawRecord = await runUpdate({
      winRecordId, updatedWinRecord
    });
    const entryRecord = new EntryRecord<WinRecord>(rawRecord as any);
    debugger;
    return {
      ...entryRecord.entry
    };
  };

  return {
    createWinRecord,
    updateWinRecord,
  };
};
