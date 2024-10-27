import React, { useCallback, useEffect, useRef, useState } from "react";

import "./common.css";
import { Scale } from "..//generated-types";
import OrbitPill from "./OrbitPill";
import { debounce } from "./utils";
import { OrbitDescendant } from "@ui/src/state";
import { motion, PanInfo, useAnimation } from "framer-motion";

export interface VisMovementLateralProps {
  goLeftAction: Function;
  goRightAction: Function
  orbitSiblings: Array<OrbitDescendant>;
}
const SCROLL_TIMEOUT = 100; // ms to wait before snapping back

const VisMovementLateral: React.FC<VisMovementLateralProps> = ({
  orbitSiblings,
  goLeftAction,
  goRightAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const controls = useAnimation();

  const itemWidth = 100; // Adjust based on your pill width
  const itemSpacing = 48; // 3rem in pixels, adjust if needed

  const calculateOffset = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      return containerWidth / 2 - itemWidth / 2;
    }
    return 0;
  };

  useEffect(() => {
    const offset = calculateOffset();
    controls.start({ x: offset - selectedIndex * (itemWidth + itemSpacing) });
  }, [selectedIndex, controls]);

  const applyDynamicResistance = (delta: number) => {
    const resistanceFactor = 0.9; // Increased resistance factor for slower movement
    return delta * resistanceFactor;
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = calculateOffset();
    const currentX = offset - selectedIndex * (itemWidth + itemSpacing);
    const resistedDelta = applyDynamicResistance(info.delta.x);
    
    controls.set({ x: currentX + resistedDelta });
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = calculateOffset();
    const resistedOffset = applyDynamicResistance(info.offset.x/4);
    const currentX = offset - selectedIndex * (itemWidth + itemSpacing) + resistedOffset;
    const nearestIndex = Math.round((offset - currentX) / (itemWidth + itemSpacing));
    const clampedIndex = Math.max(0, Math.min(nearestIndex, orbitSiblings.length - 1));

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      if (clampedIndex > selectedIndex) {
        goRightAction(clampedIndex);
      } else {
        goLeftAction(clampedIndex);
      }
    }

    controls.start({ 
      x: offset - clampedIndex * (itemWidth + itemSpacing), 
      transition: { 
        type: "spring", 
        stiffness: 100, // Reduced stiffness for slower movement
        damping: 2, // Adjusted damping for smoother motion
        mass: 10,
        duration: 1.8 // Added duration to ensure a slower, consistent speed
      } 
    });
  };

  const handlePillClick = (index: number) => {
    setSelectedIndex(index);
    if (index > selectedIndex) {
      goRightAction(index);
    } else if (index < selectedIndex) {
      goLeftAction(index);
    }
  };

  return (
    <div ref={containerRef} className="vis-move-lateral-container">
      <motion.div
        className="intersecting-pill-row"
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.05} // Reduced elastic effect
        dragTransition={{ power: 0.3, timeConstant: 700 }} // Slower drag
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {orbitSiblings.map((orbit, idx) => (
          <motion.div
            key={idx}
            className="intersecting-pill"
            onClick={(e) => {
              e.stopPropagation();
              handlePillClick(idx);
            }}
          >
            <OrbitPill
              name={orbit?.orbitName}
              scale={orbit?.orbitScale as Scale}
              selected={idx === selectedIndex}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default VisMovementLateral;