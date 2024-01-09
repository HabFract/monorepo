import { mapZomeFn } from "../../connection";
import { DNAIdMappings } from "../../types";
import {
  HAPP_DNA_NAME,
  HAPP_ZOME_NAME_PERSONAL_HABITS,
} from "../../../constants";
import {
  CreateResponsePayload,
  Orbit,
  OrbitCreateUpdateParams,
  OrbitUpdateParams,
} from "../../generated";
import {
  ActionHashB64,
  Record as HolochainRecord,
  encodeHashToBase64,
} from "@holochain/client";
import { EntryRecord } from "@holochain-open-dev/utils";

export type createArgs = { orbit: OrbitCreateUpdateParams };
export type updateArgs = { orbit: OrbitUpdateParams };
export type createHandler = (
  root: any,
  args: createArgs
) => Promise<CreateResponsePayload>;
export type updateHandler = (
  root: any,
  args: updateArgs
) => Promise<CreateResponsePayload>;

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<Omit<Orbit, "id" | "eH">, HolochainRecord>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "create_my_orbit"
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
    "update_orbit"
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
        frequency,
        scale,
      },
    }
  ) => {
    const rawRecord = await runCreate({
      name,
      sphereHash,
      parentHash,
      metadata: {
        timeframe: { startTime, endTime },
        description,
      },
      frequency,
      scale,
    });
    const entryRecord = new EntryRecord<Orbit>(rawRecord);
    return {
      actionHash: encodeHashToBase64(entryRecord.actionHash),
      entryHash: encodeHashToBase64(entryRecord.entryHash),
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
    }
  ) => {
    const rawRecord = await runUpdate({
      originalOrbitHash: id,
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
    const entryRecord = new EntryRecord<Orbit>(rawRecord);
    return {
      id: entryRecord.actionHash,
    };
  };

  return {
    createOrbit,
    updateOrbit,
  };
};
