import { DNAIdMappings } from "../types";
import Sphere from "./sphere";
import Orbit from "./orbit";

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  return {
    ...Sphere(dnaConfig, conductorUri),
    ...Orbit(dnaConfig, conductorUri),
  };
};
