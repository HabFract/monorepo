import React, { useCallback, useEffect, useRef, useState } from "react";

import "./common.css";
import { Scale } from "..//generated-types";
import OrbitPill from "./OrbitPill";
import { useScroll, useSpring, useTransform } from "framer-motion";

export interface VisMovementLateralProps {
  orbits: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>;
}

const VisMovementLateral: React.FC<VisMovementLateralProps> = ({ orbits }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(null);
  const isAnimating = useRef(false);
  const lastExecutionTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Throttle function
  const throttle = (func: Function, limit: number) => {
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastExecutionTime.current >= limit) {
        func(...args);
        lastExecutionTime.current = now;
      }
    };
  };

  const snapToCenter = useCallback((orbitId: string) => {
    const container = containerRef.current;
    const pill = container?.querySelector(`#${orbitId}`);

    if (!container || !pill) return;

    const containerWidth = container.offsetWidth;
    const pillWidth = (pill as HTMLElement).offsetWidth;
    const pillLeft = (pill as HTMLElement).offsetLeft;
    const targetScrollLeft = pillLeft - (containerWidth - pillWidth) / 2;

    isAnimating.current = true;
    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isAnimating.current = false;
    }, 50);
  }, []);

  const getMostCenteredPill = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestPill: Element | null = null;
    let minDistance = Infinity;

    container.querySelectorAll('.intersecting-pill').forEach((pill) => {
      const pillRect = pill.getBoundingClientRect();
      const pillCenter = pillRect.left + pillRect.width / 2;
      const distance = Math.abs(pillCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestPill = pill;
      }
    });

    return (closestPill as any)?.id || null;
  }, []);

  const handleScroll = useCallback(throttle(() => {
    if (isAnimating.current) return;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const mostCenteredPillId = getMostCenteredPill();
      if (mostCenteredPillId && mostCenteredPillId !== selectedOrbit) {
        setSelectedOrbit(mostCenteredPillId);
        snapToCenter(mostCenteredPillId);
      }
    }, 200);
  }, 1000), [selectedOrbit, snapToCenter, getMostCenteredPill]); 

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (containerRef.current && orbits.length > 0) {
      const firstPill = containerRef.current.querySelector(".intersecting-pill");
      if (firstPill) {
        const firstOrbitId = `pill-${orbits[0].orbitName.split(' ').join('-')}`;
        setSelectedOrbit(firstOrbitId);
        snapToCenter(firstOrbitId);
      }
    }
  }, [orbits, snapToCenter]);

  return (
    <div ref={containerRef} className="vis-move-lateral-container">
      <div className="intersecting-pill-row">
        {orbits.map((orbit, idx) => (
          <span 
            key={`${idx + orbit.orbitName}`} 
            id={`pill-${orbit.orbitName.split(' ').join('-')}`} 
            className="intersecting-pill"
          >
            <OrbitPill
              name={orbit.orbitName}
              scale={orbit.orbitScale}
              selected={selectedOrbit === `pill-${orbit.orbitName.split(' ').join('-')}`}
            />
          </span>
        ))}
      </div>
    </div>
  );
};

export default VisMovementLateral;