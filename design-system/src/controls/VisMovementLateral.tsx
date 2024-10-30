import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "./common.css";
import { Scale } from "..//generated-types";
import OrbitPill from "./OrbitPill";
import { OrbitDescendant, OrbitNodeDetails } from "@ui/src/state";
import { motion, PanInfo, useAnimation } from "framer-motion";

export interface VisMovementLateralProps {
  goLeftAction: Function;
  goRightAction: Function
  currentOrbitDetails: OrbitNodeDetails | null,
  orbitSiblings: Array<OrbitDescendant>;
}

const VisMovementLateral: React.FC<VisMovementLateralProps> = ({
  orbitSiblings,
  goLeftAction,
  goRightAction,
  currentOrbitDetails
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const controls = useAnimation();
  const dragStartX = useRef(0);

  const itemWidth = 100; // Adjust based on your pill width
  const itemSpacing = 48; // 3rem in pixels, adjust if needed

  const currentOrbitDetailsIndex = useMemo(() => {
    if (!currentOrbitDetails || !currentOrbitDetails?.id) return 0;
    const possibleCurrentOrbitIndex = orbitSiblings.findIndex(orbit => orbit.id === currentOrbitDetails.id)
    if(possibleCurrentOrbitIndex == -1) return null;

    const newIndex = !!currentOrbitDetails
    ? possibleCurrentOrbitIndex
    : 0;
    return newIndex
  }, [currentOrbitDetails?.eH, orbitSiblings])

  const calculateOffset = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      return containerWidth / 2 - itemWidth / 2;
    }
    return 0;
  };

  useEffect(() => {
    const offset = calculateOffset();
    if(currentOrbitDetailsIndex == null) return;
    if(selectedIndex !== currentOrbitDetailsIndex) setSelectedIndex(currentOrbitDetailsIndex);

    controls.start({ x: offset - selectedIndex * (itemWidth + itemSpacing) });
  }, [selectedIndex, controls, currentOrbitDetailsIndex, currentOrbitDetails?.id, orbitSiblings]);

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    dragStartX.current = info.point.x;
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = calculateOffset();
    const currentX = offset - selectedIndex * (itemWidth + itemSpacing);
    const dragDelta = info.point.x - dragStartX.current;
    const resistanceFactor = 0.8; // Adjust this value to change resistance
    const resistedDelta = dragDelta * resistanceFactor;
    
    controls.set({ x: currentX + resistedDelta });
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = calculateOffset();
    const dragDelta = (info.point.x - dragStartX.current);
    const resistanceFactor = 0.8; // Should match the factor in handleDrag
    const resistedDelta = dragDelta * resistanceFactor;
    const currentX = offset - selectedIndex * (itemWidth + itemSpacing) + resistedDelta;
    const deltaIndex = Math.round(resistedDelta / (itemWidth + itemSpacing));
    const newIndex = Math.max(0, Math.min(selectedIndex - deltaIndex, orbitSiblings.length - 1));
  
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
      if (newIndex > selectedIndex) {
        goRightAction(newIndex);
      } else {
        goLeftAction(newIndex);
      }
    }
  
    const isEndItem = newIndex === 0 || newIndex === orbitSiblings.length - 1;
    const targetX = offset - newIndex * (itemWidth + itemSpacing);
    
    controls.start({ 
      x: targetX, 
      transition: { 
        type: "spring", 
        stiffness: isEndItem ? 1000 : 500, // Higher stiffness for end items
        damping: isEndItem ? 100 : 50, // Higher damping for end items
        mass: 1,
        restDelta: 0.001, // Smaller rest delta for more precise stopping
        restSpeed: 0.001, // Smaller rest speed for more precise stopping
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
    <div ref={containerRef} className="vis-move-lateral-container fade-edges-lateral clip-top-left" >
      <motion.div
        className="intersecting-pill-row"
        drag="x"
        dragConstraints={containerRef}
        dragElastic={.5}
        dragMomentum={true}
        onDragStart={handleDragStart}
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