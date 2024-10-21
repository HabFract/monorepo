import { DNAIdMappings } from "../types";
import Sphere from "./sphere";
import Orbit from "./orbit";
import WinRecord from "./win_record";

export default (dnaConfig: DNAIdMappings, conductorUri: string) => {
  return {
    ...Sphere(dnaConfig, conductorUri),
    ...Orbit(dnaConfig, conductorUri),
    ...WinRecord(dnaConfig, conductorUri),
  };
};
