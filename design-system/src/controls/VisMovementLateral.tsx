import React from "react";

import "./common.css";
import { Scale } from "..//generated-types";
import OrbitPill from "./OrbitPill";

export interface VisMovementLateralProps {
  orbits: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>;
}

const VisMovementLateral: React.FC<VisMovementLateralProps> = ({
  orbits
}) => {
  return (
    <div className="vis-move-lateral-container">
      { orbits.map((orbit, idx) => <OrbitPill key={idx} name={orbit.orbitName} scale={orbit.orbitScale}></OrbitPill>)}
    </div>
  );
};

export default VisMovementLateral;