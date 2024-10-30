import React, { useCallback, useEffect, useRef, useState } from "react";
import "./common.css";
import { Scale } from "../generated-types";
import { OrbitDescendant } from "@ui/src/state";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { getIconForPlanetValue } from "..";

export interface VisMovementVerticalProps {
  moveUpAction: Function;
  moveDownAction: Function;
  orbitDescendants: Array<OrbitDescendant>;
}

const VisMovementVertical: React.FC<VisMovementVerticalProps> = ({
  orbitDescendants,
  moveUpAction,
  moveDownAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const controls = useAnimation();
  const dragStartY = useRef(0);

  const itemHeight = 24;
  const itemSpacing = 50;

  const calculateOffset = () => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      return containerHeight / 2 - itemHeight / 2;
    }
    return 0;
  };

  useEffect(() => {
    const offset = calculateOffset();
    controls.start({ y: offset - selectedIndex * (itemHeight + itemSpacing) });
  }, [selectedIndex, controls]);


  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    dragStartY.current = info.point.y;
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = calculateOffset();
    const currentY = offset - selectedIndex * (itemHeight + itemSpacing);
    const dragDelta = info.point.y - dragStartY.current;
    const resistanceFactor = 0.5; // Adjust this value to change resistance
    const resistedDelta = dragDelta * resistanceFactor;

    controls.set({ y: currentY + resistedDelta });
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = calculateOffset();
    const dragDelta = (info.point.y - dragStartY.current);
    const resistanceFactor = 0.5; // Should match the factor in handleDrag
    const resistedDelta = dragDelta * resistanceFactor;
    const currentX = offset - selectedIndex * (itemHeight + itemSpacing) + resistedDelta;
    const deltaIndex = Math.round(resistedDelta / (itemHeight + itemSpacing));
    const newIndex = Math.max(0, Math.min(selectedIndex - deltaIndex, orbitDescendants.length - 1));

    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
      if (newIndex > selectedIndex) {
        moveDownAction(newIndex);
      } else {
        moveUpAction(newIndex);
      }
    }

    const isEndItem = newIndex === 0 || newIndex === orbitDescendants.length - 1;
    const targetY = offset - newIndex * (itemHeight + itemSpacing);

    controls.start({
      y: targetY,
      transition: {
        type: "spring",
        stiffness: isEndItem ? 3000 : 2500, // Higher stiffness for end items
        damping: isEndItem ? 400 : 80, // Higher damping for end items
        mass: 1,
        restDelta: 0.001, // Smaller rest delta for more precise stopping
        restSpeed: 0.001, // Smaller rest speed for more precise stopping
      }
    });
  };

  const handlePlanetSelect = (index: number) => {
    setSelectedIndex(index);
    if (index > selectedIndex) {
      moveDownAction(index);
    } else if (index < selectedIndex) {
      moveUpAction(index);
    }
  };


  return (
    <div ref={containerRef} className="vis-move-vertical-container fade-edges-vertical clip-bottom-right">
      <motion.div
        className="intersecting-planet-column"
        drag="y"
        dragConstraints={containerRef}
        dragElastic={.5}
        dragMomentum={true}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {orbitDescendants.map((orbit, idx) => {
          const Icon = getIconForPlanetValue(orbit.orbitScale as Scale);
          return (
            <div
              key={idx}
              id={`planet-${orbit?.orbitName?.split(' ')?.join('-')}`}
              className={`intersecting-planet ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlanetSelect(idx);
              }}
            >
              <Icon />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default VisMovementVertical;
