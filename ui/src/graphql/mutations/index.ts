import { DNAIdMappings } from "../types";
import Orbit from "./orbit";
import Sphere from "./sphere";

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  return {
    ...Orbit(dnaConfig, conductorUri),
    ...Sphere(dnaConfig, conductorUri),
  };
};
