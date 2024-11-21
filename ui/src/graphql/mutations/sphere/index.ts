import { mapZomeFn } from "../../connection";
import { DNAIdMappings } from "../../types";
import {
  HAPP_DNA_NAME,
  HAPP_ZOME_NAME_PERSONAL_HABITS,
} from "../../../constants";
import {
  Sphere,
  SphereCreateParams,
  SphereUpdateParams,
} from "../../generated";
import { EntryRecord } from "@holochain-open-dev/utils";
import {
  ActionHash,
  ActionHashB64,
  EntryHashB64,
  Record as HolochainRecord,
  encodeHashToBase64,
} from "@holochain/client";

export type createArgs = { sphere: SphereCreateParams };
export type updateArgs = { sphere: SphereUpdateParams };
export type createHandler = (root: any, args: createArgs) => Promise<object>; // TODO: swap this type out for correct response type
export type updateHandler = (root: any, args: updateArgs) => Promise<object>;
export type deleteHandler = (
  root: any,
  args: { sphereHash: ActionHashB64 }
) => Promise<ActionHashB64>;

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<
    Omit<Sphere & { eH: EntryHashB64 }, "id" | "eH">,
    HolochainRecord
  >(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "create_my_sphere"
  );
  const runUpdate = mapZomeFn<
    {
      originalSphereHash: ActionHashB64;
      updatedSphere: Omit<Sphere, "id" | "eH">;
    },
    HolochainRecord
  >(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "update_sphere"
  );
  const runDelete = mapZomeFn<ActionHashB64, ActionHash>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "delete_sphere"
  );

  const createSphere: createHandler = async (
    _,
    { sphere: { name, ...metadata } }
  ) => {
    const rawRecord = await runCreate({
      name,
      metadata: {
        //@ts-ignore
        description: metadata?.description,
        hashtag: metadata?.hashtag,
        image: metadata?.image,
      },
    });
    const entryRecord = new EntryRecord<Sphere>(rawRecord as any);

    return {
      actionHash: entryRecord.actionHash as any,
      entryHash: encodeHashToBase64(entryRecord.entryHash),
      name,
    };
  };

  const updateSphere: updateHandler = async (
    _,
    { sphere: { id, name, image, hashtag, description } }
  ) => {
    const rawRecord = await runUpdate({
      originalSphereHash: id as ActionHashB64,
      updatedSphere: {
        name,
        metadata: {
          //@ts-ignore
          description: description,
          hashtag: hashtag,
          image: image,
        },
      },
    });
    const entryRecord = new EntryRecord<Sphere>(rawRecord as any);
    return {
      actionHash: entryRecord.actionHash as any,
      entryHash: encodeHashToBase64(entryRecord.entryHash),
    };
  };

  const deleteSphere: deleteHandler = async (_, args) => {
    const id = args.sphereHash;
    const rawRecord = await runDelete(id);
    return encodeHashToBase64(rawRecord);
  };

  return {
    createSphere,
    updateSphere,
    deleteSphere,
  };
};
