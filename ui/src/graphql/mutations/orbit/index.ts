import { mapZomeFn } from "../../connection";
import { DNAIdMappings } from "../../types";
import {
  HAPP_DNA_NAME,
  HAPP_ZOME_NAME_PERSONAL_HABITS,
} from "../../../constants";
import {
  CreateOrbitResponsePayload,
  Orbit,
  OrbitCreateParams,
  OrbitUpdateParams,
} from "../../generated";
import {
  ActionHash,
  ActionHashB64,
  Record as HolochainRecord,
  encodeHashToBase64,
} from "@holochain/client";
import { EntryRecord } from "@holochain-open-dev/utils";

export type createArgs = { orbit: OrbitCreateParams };
export type updateArgs = { orbit: OrbitUpdateParams };
export type createHandler = (
  root: any,
  args: createArgs,
) => Promise<CreateOrbitResponsePayload>;
export type updateHandler = (
  root: any,
  args: updateArgs,
) => Promise<CreateOrbitResponsePayload>;
export type deleteHandler = (
  root: any,
  args: { orbitHash: ActionHashB64 },
) => Promise<ActionHashB64>;

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<Omit<Orbit, "id" | "eH">, HolochainRecord>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "create_my_orbit",
  );
  const runUpdate = mapZomeFn<
    {
      originalOrbitHash: ActionHashB64;
      updatedOrbit: Omit<Orbit, "id" | "eH">;
    },
    HolochainRecord
  >(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "update_orbit",
  );
  const runDelete = mapZomeFn<ActionHashB64, ActionHash>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "delete_orbit",
  );

  const createOrbit: createHandler = async (
    _,
    {
      orbit: {
        name,
        description,
        startTime,
        endTime,
        sphereHash,
        parentHash,
        childHash,
        frequency,
        scale,
      },
    },
  ) => {
    if (!sphereHash)
      throw new Error("Cannot create an orbit not linked to a sphere!");
    const rawRecord = await runCreate({
      name,
      sphereHash,
      parentHash,
      childHash,
      metadata: {
        timeframe: { startTime, endTime },
        description,
      },
      frequency,
      scale,
    });
    const entryRecord = new EntryRecord<Orbit>(rawRecord as any);
    return {
      id: entryRecord.actionHash as any,
      eH: encodeHashToBase64(entryRecord.entryHash),
      name: entryRecord.entry.name,
      frequency: entryRecord.entry.frequency,
      sphereHash: entryRecord.entry.sphereHash,
      parentHash: entryRecord.entry.parentHash,
      childHash: entryRecord.entry.childHash,
      metadata: {
        timeframe: {
          startTime: entryRecord.entry.metadata!.timeframe.startTime,
          endTime: entryRecord.entry.metadata?.timeframe?.endTime,
          description: entryRecord.entry.metadata?.description,
        }
      },
      scale: entryRecord.entry.scale,
    };
  };

  const updateOrbit: updateHandler = async (
    _,
    {
      orbit: {
        id,
        name,
        description,
        startTime,
        endTime,
        sphereHash,
        parentHash,
        frequency,
        scale,
      },
    },
  ) => {
    const rawRecord = await runUpdate({
      originalOrbitHash: id as ActionHashB64,
      updatedOrbit: {
        name,
        sphereHash,
        parentHash,
        metadata: {
          timeframe: { startTime, endTime },
          description,
        },
        frequency,
        scale,
      },
    });
    const entryRecord = new EntryRecord<Orbit>(rawRecord as any);
    return {
      id: entryRecord.actionHash as any,
      eH: encodeHashToBase64(entryRecord.entryHash),
      name: entryRecord.entry.name,
      frequency: entryRecord.entry.frequency,
      sphereHash: entryRecord.entry.sphereHash,
      parentHash: entryRecord.entry.parentHash,
      childHash: entryRecord.entry.childHash,
      metadata: {
        timeframe: {
          startTime: entryRecord.entry.metadata!.timeframe.startTime,
          endTime: entryRecord.entry.metadata?.timeframe?.endTime,
          description: entryRecord.entry.metadata?.description,
        }
      },
      scale: entryRecord.entry.scale,
    };
  };

  const deleteOrbit: deleteHandler = async (_, args) => {
    const id = args.orbitHash;
    const rawRecord = await runDelete(id);
    return encodeHashToBase64(rawRecord);
  };

  return {
    createOrbit,
    updateOrbit,
    deleteOrbit,
  };
};
