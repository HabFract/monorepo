import { mapZomeFn } from "../../connection";
import { DNAIdMappings } from "../../types";
import { HAPP_DNA_NAME, HAPP_ZOME_NAME_PERSONAL_HABITS } from "../../../constants";
import { Orbit, OrbitCreateUpdateParams } from "../../generated";

export type createArgs = { orbit: OrbitCreateUpdateParams };
export type createHandler = (root: any, args: createArgs) => Promise<Orbit>;

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<Omit<Orbit, "id">, Orbit>(
    dnaConfig,
    conductorUri,
    HAPP_DNA_NAME,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "create_orbit"
  );

  const createOrbit: createHandler = async (
    _,
    { orbit: { name, description, startTime, endTime, sphereHash, parentHash, frequency, scale } }
  ) => {
    console.log('{ ', {
      name,
      sphereHash,
      parentHash,
      metadata: {
        timeframe: { startTime, endTime },
        description
      },
      frequency,
      scale
    });
    return runCreate({
      name,
      sphereHash,
      parentHash,
      metadata: {
        timeframe: { startTime, endTime },
        description
      },
      frequency,
      scale
    });
  };

  return {
    createOrbit,
  };
};
