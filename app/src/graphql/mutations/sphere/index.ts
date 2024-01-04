import { mapZomeFn } from "../../connection";
import { DNAIdMappings } from "../../types";
import { HAPP_DNA_NAME, HAPP_ZOME_NAME_PERSONAL_HABITS } from "../../../constants";
import { CreateResponsePayload, Sphere, SphereCreateUpdateParams } from "../../generated";
import { EntryRecord } from "@holochain-open-dev/utils";
import { Record as HolochainRecord, encodeHashToBase64 } from "@holochain/client";

export type createArgs = { sphere: SphereCreateUpdateParams };
export type createHandler = (root: any, args: createArgs) => Promise<CreateResponsePayload>;

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<Omit<Sphere, "id">, HolochainRecord>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "create_my_sphere"
  );

  const createSphere: createHandler = async (
    _,
    { sphere: { name, ...metadata } }
  ) => {
    const rawRecord = await runCreate({
      name,
      //@ts-ignore
      metadata: { description: metadata?.description, hashtag: metadata?.description }
    });
    const entryRecord = new EntryRecord<Sphere>(rawRecord);

    return {
      actionHash: encodeHashToBase64(entryRecord.actionHash),
      entryHash: encodeHashToBase64(entryRecord.entryHash),
    }
  };

  return {
    createSphere,
  };
};
