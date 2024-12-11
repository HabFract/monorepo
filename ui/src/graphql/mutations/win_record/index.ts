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
import { EntryRecord, encodeHashToBase64, HolochainRecord } from "../../utils";

export type createHandler = (
  root: any,
  args: WinRecordCreateParams
) => Promise<WinRecord>;
export type updateHandler = (
  root: any,
  args: WinRecordUpdateParams
) => Promise<WinRecord>;

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<WinRecordCreateParams, HolochainRecord>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "create_or_update_win_record"
  );

  const createWinRecord = async (_, args) => {
    // Bypass typechecking here since GraphQL doesn't allow hashmaps.
    const { winRecord } = args as any;
    const rawRecord = await runCreate({
      orbitEh: winRecord.orbitEh,
      winData: winRecord.winData.reduce((acc, val) => {
        acc[val.date] =
          "single" in val ? { single: val.single } : { multiple: val.multiple };
        return acc;
      }, {}) as any,
    });
    const entryRecord = new EntryRecord<WinRecord>(rawRecord as any);
    return {
      winData: Object.entries(entryRecord.entry.winData).map(
        ([date, value]) => ({ date, value })
      ),
      id: entryRecord.actionHash,
      eH: encodeHashToBase64(entryRecord.entryHash),
    };
  };

  return {
    createWinRecord,
  };
};
