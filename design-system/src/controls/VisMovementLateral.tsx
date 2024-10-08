import React, { useEffect, useRef, useState } from "react";

import "./common.css";
import { Scale } from "..//generated-types";
import OrbitPill from "./OrbitPill";

export interface VisMovementLateralProps {
  orbits: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>;
}

const VisMovementLateral: React.FC<VisMovementLateralProps> = ({ orbits }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const observer = observerRef.current;
    if (!container || !observer) return;


    const options = {
      root: container,
      rootMargin: "0px",
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    };

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0.8) {  // Adjust this threshold as needed
          setSelectedOrbit(entry.target.id);
        }
      });
    }, options);

    const pillElements = container.querySelectorAll(".intersecting-pill");
    pillElements.forEach((pill) => intersectionObserver.observe(pill));

    return () => intersectionObserver.disconnect();
  }, [orbits]);

  useEffect(() => {
    if (containerRef.current && orbits.length > 0) {
      const firstPill = containerRef.current.querySelector(".intersecting-pill");
      if (firstPill) {
        const containerWidth = containerRef.current.offsetWidth;
        const pillWidth = firstPill.clientWidth;
        const scrollPosition = (pillWidth - containerWidth) / 2;
        containerRef.current.scrollLeft = scrollPosition;
      }
    }
  }, [orbits]);

  console.log('selectedOrbit :>> ', selectedOrbit);

  return (
    <div ref={containerRef} className="vis-move-lateral-container">
      <div className="intersecting-pill-row">
        {orbits.map((orbit, idx) => (
          <span id={orbit.orbitName} className="intersecting-pill">
            <OrbitPill
              key={`${idx + orbit.orbitName}`}
              name={orbit.orbitName}
              scale={orbit.orbitScale}
              selected={selectedOrbit === orbit.orbitName}
            />
          </span>
        ))}
      </div>
      <div
        ref={observerRef}
        className="vis-move-lateral-intersector"
      />
    </div>
  );
};


export default VisMovementLateral;