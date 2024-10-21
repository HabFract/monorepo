import { DNAIdMappings } from "../types";
import Orbit from "./orbit";
import Sphere from "./sphere";
import WinRecord from "./win_record";

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  return {
    ...Orbit(dnaConfig, conductorUri),
    ...Sphere(dnaConfig, conductorUri),
    ...WinRecord(dnaConfig, conductorUri),
  };
};
