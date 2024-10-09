import React, { useCallback, useEffect, useRef, useState } from "react";
import { Scale } from "../generated-types";
import "./common.css";

export interface VisMovementVerticalProps {
  orbitDescendants: Array<{ orbitName: string, orbitScale: Scale }>;
}

const VisMovementVertical: React.FC<VisMovementVerticalProps> = ({ orbitDescendants: orbits }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(null);
  const isAnimating = useRef(false);
  const lastExecutionTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

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
    const planet = container?.querySelector(`#${orbitId}`);

    if (!container || !planet) return;

    const containerHeight = container.offsetHeight;
    const planetHeight = (planet as HTMLElement).offsetHeight;
    const planetTop = (planet as HTMLElement).offsetTop;
    const targetScrollTop = planetTop - (containerHeight - planetHeight) / 2;

    isAnimating.current = true;
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isAnimating.current = false;
    }, 50);
  }, []);
  
  const getMostCenteredPlanet = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;
  
    const containerRect = container.getBoundingClientRect();
    const markerY = containerRect.top + containerRect.height / 2;
  
    let closestPlanet: Element | null = null;
    let minDistance = Infinity;
  
    container.querySelectorAll('.intersecting-planet').forEach((planet) => {
      const planetRect = planet.getBoundingClientRect();
      const planetCenter = planetRect.top + planetRect.height / 2;
      const distance = Math.abs(planetCenter - markerY);
  
      if (distance < minDistance) {
        minDistance = distance;
        closestPlanet = planet;
      }
    });
  
    return (closestPlanet as any)?.id || null;
  }, []);

  const handleScroll = useCallback(throttle(() => {
    if (isAnimating.current) return;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const mostCenteredPlanetId = getMostCenteredPlanet();
      if (mostCenteredPlanetId && mostCenteredPlanetId !== selectedOrbit) {
        console.log("Setting y axis planet to: ", mostCenteredPlanetId)
        setSelectedOrbit(mostCenteredPlanetId);
        snapToCenter(mostCenteredPlanetId);
      }
    }, 200);
  }, 1000), [selectedOrbit, snapToCenter, getMostCenteredPlanet]);

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
      const firstPlanet = containerRef.current.querySelector(".intersecting-planet");
      if (firstPlanet) {
        const firstOrbitId = `planet-${orbits[0].orbitName.split(' ').join('-')}`;
        setSelectedOrbit(firstOrbitId);
        snapToCenter(firstOrbitId);
      }
    }
  }, [orbits, snapToCenter]);

  const getIconForScale = (scale: Scale) => {
    // Implement logic to return appropriate icon based on scale
    // For now, we'll just return a placeholder
    return "🪐";
  };

  return (
    <div ref={containerRef} className="vis-move-vertical-container">
      <div className="intersecting-planet-column">
        {orbits.map((orbit, idx) => (
          <span 
            key={`${idx + orbit.orbitName}`} 
            id={`planet-${orbit.orbitName.split(' ').join('-')}`} 
            className={
              selectedOrbit === `planet-${orbit.orbitName.split(' ').join('-')}`
                ? "intersecting-planet selected"
                : "intersecting-planet"
              }
          >
            {getIconForScale(orbit.orbitScale)}
          </span>
        ))}
        <div className="center-marker"></div>
      </div>
    </div>
  );
};

export default VisMovementVertical;