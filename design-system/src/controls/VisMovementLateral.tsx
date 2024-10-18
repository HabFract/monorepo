import React, { useCallback, useEffect, useRef, useState } from "react";

import "./common.css";
import { Scale } from "..//generated-types";
import OrbitPill from "./OrbitPill";
import { debounce } from "./utils";

export interface VisMovementLateralProps {
  moveLeftAction: Function;
  moveRightAction: Function
  orbitSiblings: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>;
}
const SCROLL_TIMEOUT = 100; // ms to wait before snapping back


const VisMovementLateral: React.FC<VisMovementLateralProps> = ({ orbitSiblings, moveLeftAction, moveRightAction }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(`pill-${orbitSiblings[0].orbitName.split(' ').join('-')}`);
  const isAnimating = useRef(false);
  const lastExecutionTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollDirection = useRef<'left' | 'right'>();
  const scrollStartTime = useRef<number | null>(null);
  const latestSnapBackTimeout = useRef<any>(null);

  const lastSnappedPlanet = useRef<string | null>(null);

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

  const chooseMoveDebounced = useCallback(
    debounce(() => {
      if (scrollDirection.current === 'left') {
        return Promise.resolve(moveLeftAction());
      } else if (scrollDirection.current === 'right') {
        return Promise.resolve(moveRightAction());
      }
    }, 500),
    [moveLeftAction, moveRightAction]);

  const snapToCenter = useCallback((orbitId: string) => {
    const container = containerRef.current;
    const pill = container?.querySelector(`#${orbitId}`);

    if (!container || !pill) return;

    const containerWidth = container.offsetWidth;
    const pillWidth = (pill as HTMLElement).offsetWidth;
    const pillLeft = (pill as HTMLElement).offsetLeft;
    const targetScrollLeft = pillLeft - (containerWidth - pillWidth) / 2;

    console.log('lastSNappedPlanet.current :>> ', lastSnappedPlanet.current, orbitId);
    isAnimating.current = true;
    lastSnappedPlanet.current = orbitId;
    scrollStartTime.current = null;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
    orbitId !== selectedOrbit && chooseMoveDebounced();

    setTimeout(() => {
      isAnimating.current = false;
    }, 150);
  }, [chooseMoveDebounced]);

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

    // Set scroll start time if it hasn't been set
    if (scrollStartTime.current === null) {
      scrollStartTime.current = Date.now();
      console.log('scrollStartTime.current :>> ', scrollStartTime.current);
      if (latestSnapBackTimeout.current) {
        clearTimeout(latestSnapBackTimeout.current);
      }
      latestSnapBackTimeout.current = setTimeout(() => {
        console.log("Trying snapback", selectedOrbit, getMostCenteredPill())
        if (selectedOrbit == getMostCenteredPill()) {
          // If we've exceeded the scroll timeout, snap back to the currently selected planet
          snapToCenter(getMostCenteredPill());
        }
      }, SCROLL_TIMEOUT);
    }

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const mostCenteredPillId = getMostCenteredPill();
      if (mostCenteredPillId && mostCenteredPillId !== selectedOrbit) {

        let triggerSnap = false;
        if (selectedOrbit == null) {
          triggerSnap = true;
        } else {
          const fromIndex = orbitSiblings.findIndex(planet => (planet.orbitName.split(' ').join('-') == selectedOrbit!.split("pill-")![1]));
          const toIndex = orbitSiblings.findIndex(planet => (planet.orbitName.split(' ').join('-') == mostCenteredPillId.split("pill-")![1]));
          triggerSnap = Math.abs(toIndex - fromIndex) <=3;
          scrollDirection.current = (toIndex > fromIndex ? 'right' : 'left');
          console.log('toIndex, fromIndex, triggerSnap :>> ', toIndex, fromIndex, triggerSnap);
        }
        if (triggerSnap) {
          lastSnappedPlanet.current = mostCenteredPillId;
          setSelectedOrbit(mostCenteredPillId);
          console.log("Setting x axis planet to: ", mostCenteredPillId);
          snapToCenter(mostCenteredPillId);
        }
      }
    }, 200);
  }, 1000), [selectedOrbit, snapToCenter, getMostCenteredPill, chooseMoveDebounced, orbitSiblings]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
  //   const decreaseScrollWheelVelocity = debounce((event) => {
  //     event.preventDefault();
  //     // getting the scrolling speed.
  //     const newDeltaX = event.deltaX / 500;
  //     const ev = new WheelEvent('wheel', { deltaY: event.deltaY, deltaZ: event.deltaZ, deltaMode: event.deltaMode, deltaX: newDeltaX});
  //     if(event.isTrusted) container.dispatchEvent(ev);
      
  // }, 100);

    container.addEventListener('scroll', handleScroll);
    // container.addEventListener('wheel', decreaseScrollWheelVelocity);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      // container.removeEventListener('wheel', decreaseScrollWheelVelocity);
    };
  }, [handleScroll]);

  return (
    <div ref={containerRef} className="vis-move-lateral-container">
      <div className="intersecting-pill-row">
        {orbitSiblings.map((orbit, idx) => (
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