import { Frequency } from "@ui/src/state";
import { ReactNode } from "react";
import "./common.css";
import { Scale } from "../generated-types";
import { getIconForPlanetValue } from "../icons";

export interface OrbitPillProps { name: string, scale: Scale, selected?: boolean};

const WinCount: React.FC<OrbitPillProps> = ({
  name,
  scale,
  selected = false
}): ReactNode => {

  return (
    <div className={!selected ? "orbit-pill-container" : "orbit-pill-container selected"}>
      <span className="orbit-scale-icon min-w-4">{ getIconForPlanetValue(scale)({}) }</span><span className="orbit-name">{ name }</span>
    </div>
  );
};

export default WinCount;