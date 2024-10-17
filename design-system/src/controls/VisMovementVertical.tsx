import React, { useCallback, useEffect, useRef, useState } from "react";
import { Scale } from "../generated-types";
import "./common.css";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export interface VisMovementVerticalProps {
  moveUpAction: Function;
  moveDownAction: Function
  orbitDescendants: Array<{ orbitName: string, orbitScale: Scale }>;
}

const mapToPlanetName = (planetId: string) => planetId!.split("planet-")![1];
const mapToPlanetId = (planetName: string) => `planet-${planetName.split(' ').join('-')}`;

const VisMovementVertical: React.FC<VisMovementVerticalProps> = ({ orbitDescendants: orbits, moveUpAction, moveDownAction }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(null);
  const isAnimating = useRef(false);
  const lastExecutionTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollDirection = useRef<'up' | 'down'>();
  const lastSnappedPlanet = useRef<string | null>(null);

  const throttle = (func: Function, limit: number) => {
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastExecutionTime.current >= limit) {
        func(...args);
        lastExecutionTime.current = now;  
      }
    };
  };
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    return function executedFunction(...args: any[]) {
      const later = () => {
        timeout = null;
        func(...args);
      };
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
  }

  const chooseMoveDebounced = useCallback(
    debounce(()  => {
    if (scrollDirection.current === 'up') {
      return Promise.resolve(moveUpAction());
    } else if (scrollDirection.current === 'down') {
      return Promise.resolve(moveDownAction());
    }
  }, 500),
  [moveUpAction, moveDownAction]);

  const snapToCenter = ((orbitId: string) => {
    const container = containerRef.current;
    const planet = container?.querySelector(`#${orbitId}`);

    if (!container || !planet) return;

    const containerHeight = container.offsetHeight;
    const planetHeight = (planet as HTMLElement).offsetHeight;
    const planetTop = (planet as HTMLElement).offsetTop;
    const targetScrollTop = planetTop - (containerHeight - planetHeight) / 2;

    isAnimating.current = true;
    lastSnappedPlanet.current = orbitId;

    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
    chooseMoveDebounced();
    setTimeout(() => {
      isAnimating.current = false;
    }, 150);
  });

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

    const container = containerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const mostCenteredPlanetId = getMostCenteredPlanet();
      if (mostCenteredPlanetId && mostCenteredPlanetId !== selectedOrbit) {
        let triggerSnap = false;
        if(selectedOrbit == null) {
          triggerSnap = true;
        } else {
          const fromIndex = orbits.findIndex(planet => (planet.orbitName == mapToPlanetName(selectedOrbit as string)));
          const toIndex = orbits.findIndex(planet => (planet.orbitName == mapToPlanetName(mostCenteredPlanetId)));
          triggerSnap = Math.abs(toIndex - fromIndex) == 1
          scrollDirection.current = (toIndex < fromIndex ? 'up' : 'down');
        }
        if (!triggerSnap) return;

        lastSnappedPlanet.current = mostCenteredPlanetId;
        setSelectedOrbit(mostCenteredPlanetId);
        console.log("Setting y axis planet to: ", mostCenteredPlanetId);
        snapToCenter(mostCenteredPlanetId);
      }
    }, 10);
  }, 1000), [selectedOrbit, snapToCenter, getMostCenteredPlanet, chooseMoveDebounced]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // useEffect(() => {
  //   if (containerRef.current && orbits.length > 0) {
  //     const firstPlanet = containerRef.current.querySelector(".intersecting-planet");
  //     if (firstPlanet) {
  //       console.log('trigger firstPlanet :>> ');
  //       const firstOrbitId = `planet-${orbits[0].orbitName.split(' ').join('-')}`;
  //       setSelectedOrbit(firstOrbitId);
  //       lastSnappedPlanet.current = firstOrbitId;
  //       snapToCenter(firstOrbitId);
  //     }
  //   }
  // }, [orbits, snapToCenter]);

  const getIconForScale = (scale: Scale) => {
    // Implement logic to return appropriate icon based on scale
    // For now, we'll just return a placeholder
    return "🪐";
  };

  return (
    <div ref={containerRef} className="vis-move-vertical-container">

      <motion.div
        ref={columnRef}
        className="intersecting-planet-column">
        {orbits.map((orbit, idx) => (
          <span
            key={`${idx + orbit.orbitName}`}
            id={mapToPlanetId(orbit.orbitName)}
            className={
              selectedOrbit === mapToPlanetId(orbit.orbitName)
                ? "intersecting-planet selected"
                : "intersecting-planet"
            }
          >
            {getIconForScale(orbit.orbitScale)}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default VisMovementVertical;