import React, { useCallback, useEffect, useRef, useState } from "react";
import { Scale } from "../generated-types";
import "./common.css";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { getIconForPlanetValue } from "..";
import { debounce } from "./utils";

export interface VisMovementVerticalProps {
  moveUpAction: Function;
  moveDownAction: Function
  orbitDescendants: Array<{ orbitName: string, orbitScale: Scale }>;
}
const SCROLL_TIMEOUT = 100; // ms to wait before snapping back


const mapToPlanetName = (planetId: string) => planetId!.split("planet-")![1];
const mapToPlanetId = (planetName: string) => `planet-${planetName.split(' ').join('-')}`;

const VisMovementVertical: React.FC<VisMovementVerticalProps> = ({ orbitDescendants: orbits, moveUpAction, moveDownAction }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(null);
  const isAnimating = useRef(false);
  const lastExecutionTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollStartTime = useRef<number | null>(null);
  const latestSnapBackTimeout = useRef<any>(null);
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

  const chooseMoveDebounced = useCallback(
    debounce(() => {
      if (scrollDirection.current === 'up') {
        return Promise.resolve(moveUpAction());
      } else if (scrollDirection.current === 'down') {
        return Promise.resolve(moveDownAction());
      }
    }, 500),
    [moveUpAction, moveDownAction]);

  const snapToCenter = useCallback((orbitId: string) => {
    const container = containerRef.current;
    const planet = container?.querySelector(`#${orbitId}`);

    if (!container || !planet) return;

    const containerHeight = container.offsetHeight;
    const planetHeight = (planet as HTMLElement).offsetHeight;
    const planetTop = (planet as HTMLElement).offsetTop;
    const targetScrollTop = planetTop - (containerHeight - planetHeight) / 2;

    isAnimating.current = true;
    lastSnappedPlanet.current = orbitId;
    scrollStartTime.current = null; // Reset scroll start time

    container?.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
    orbitId !== selectedOrbit && chooseMoveDebounced();
    setTimeout(() => {
      isAnimating.current = false;
    }, 150);
  }, [chooseMoveDebounced]);

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

    // Set scroll start time if it hasn't been set
    if (scrollStartTime.current === null) {
      scrollStartTime.current = Date.now();
      if (latestSnapBackTimeout.current) {
        clearTimeout(latestSnapBackTimeout.current);
      }
      latestSnapBackTimeout.current = setTimeout(() => {
        if (selectedOrbit == getMostCenteredPlanet()) {
          // If we've exceeded the scroll timeout, snap back to the currently selected planet
          snapToCenter(selectedOrbit!);
        }
      }, SCROLL_TIMEOUT);
    }

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const mostCenteredPlanetId = getMostCenteredPlanet();
      if (mostCenteredPlanetId && mostCenteredPlanetId !== selectedOrbit) {
        let triggerSnap = false;
        if (selectedOrbit == null) {
          triggerSnap = true;
        } else {
          const fromIndex = orbits.findIndex(planet => (planet.orbitName == mapToPlanetName(selectedOrbit as string)));
          const toIndex = orbits.findIndex(planet => (planet.orbitName == mapToPlanetName(mostCenteredPlanetId)));
          triggerSnap = Math.abs(toIndex - fromIndex) == 1;
          scrollDirection.current = (toIndex < fromIndex ? 'up' : 'down');
        }

        if (triggerSnap) {
          lastSnappedPlanet.current = mostCenteredPlanetId;
          setSelectedOrbit(mostCenteredPlanetId);
          snapToCenter(mostCenteredPlanetId);
        }
      }

      // Reset scroll start time
      scrollStartTime.current = null;
    }, 10);
  }, 50), [selectedOrbit, snapToCenter, getMostCenteredPlanet, chooseMoveDebounced, orbits]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div ref={containerRef} className="vis-move-vertical-container">

      <div
        ref={columnRef}
        className="intersecting-planet-column">
        {(orbits || []).map((orbit, idx) => {
          const Icon = getIconForPlanetValue(orbit.orbitScale);
          return (<span
            key={`${idx + orbit.orbitName}`}
            id={mapToPlanetId(orbit.orbitName)}
            className={
              selectedOrbit === mapToPlanetId(orbit.orbitName)
                ? "intersecting-planet selected"
                : "intersecting-planet"
            }
          ><Icon></Icon>
          </span>)
        })}
      </div>
    </div>
  );
};

export default VisMovementVertical;