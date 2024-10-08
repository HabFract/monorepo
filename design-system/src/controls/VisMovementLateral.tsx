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
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const observer = observerRef.current;
    if (!container || !observer) return;

    console.log("Setting up Intersection Observer");

    const options = {
      root: container,
      rootMargin: "0px -49% 0px -49%", // Observe only the center 2%
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    };

    const intersectionObserver = new IntersectionObserver((entries) => {
      const scrollPosition = container.scrollLeft;
      const scrollingRight = scrollPosition > lastScrollPosition.current;
      lastScrollPosition.current = scrollPosition;

      let maxRatio = 0;
      let maxRatioOrbit: string | null = null;

      entries.forEach((entry) => {
        console.log(`Intersection: ${entry.target.id}, isIntersecting: ${entry.isIntersecting}, ratio: ${entry.intersectionRatio}`);
        if (entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          maxRatioOrbit = entry.target.id;
        }
      });

      if (maxRatioOrbit && maxRatio > 0.5) {
        console.log(`Setting selected orbit to: ${maxRatioOrbit}`);
        setSelectedOrbit(maxRatioOrbit);
      }
    }, options);

    const pillElements = container.querySelectorAll(".intersecting-pill");
    console.log(`Found ${pillElements.length} pill elements`);
    pillElements.forEach((pill) => {
      console.log(`Observing pill: ${pill.id}`);
      intersectionObserver.observe(pill);
    });

    const handleScroll = () => {
      console.log("Scroll event detected");
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      console.log("Cleaning up");
      intersectionObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [orbits]);

  useEffect(() => {
    if (containerRef.current && orbits.length > 0) {
      const firstPill = containerRef.current.querySelector(".intersecting-pill");
      if (firstPill) {
        setSelectedOrbit(orbits[0].orbitName);
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
      <div
        ref={observerRef}
        className="vis-move-lateral-intersector"
      />
      </div>
    </div>
  );
};


export default VisMovementLateral;