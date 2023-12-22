import { mapZomeFn } from "../../connection";
import { DNAIdMappings } from "../../types";
import { HAPP_ID, HAPP_ZOME_NAME_PERSONAL_HABITS } from "../../../constants";
import { Sphere, SphereCreateUpdateParams } from "../../generated";

export type createArgs = { sphere: SphereCreateUpdateParams };
export type createHandler = (root: any, args: createArgs) => Promise<Sphere>;

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  const runCreate = mapZomeFn<Omit<Sphere, "id">, Sphere>(
    dnaConfig,
    conductorUri,
    HAPP_ID,
    HAPP_ZOME_NAME_PERSONAL_HABITS,
    "create_sphere"
  );

  const createSphere: createHandler = async (
    _,
    { sphere: { name, ...metadata } }
  ) => {
    return runCreate({
      name,
      metadata: { description: metadata?.description || "", hashtag: metadata?.description || "" }
    });
  };

  return {
    createSphere,
  };
};
