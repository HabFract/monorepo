import React, { useEffect, useRef, useState } from "react";

import "./common.css";
import { Scale } from "..//generated-types";
import OrbitPill from "./OrbitPill";
import { motion, PanInfo, useAnimation, useMotionValue } from "framer-motion";

export interface VisMovementLateralProps {
  orbits: Array<{ orbitName: string, orbitScale: Scale, handleOrbitSelect: () => void }>;
}


const VisMovementLateral: React.FC<VisMovementLateralProps> = ({ orbits }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [counter, setCounter] = useState(0);

  const controls = useAnimation();
  const x = useMotionValue(0);
  const resistance = 0.2;
  const threshold = 100; // pixels

  useEffect(() => {
    if (containerRef.current) {
      const cWidth = containerRef.current.offsetWidth;
      const sWidth = containerRef.current.scrollWidth;
      setContainerWidth(cWidth);
      setContentWidth(sWidth);
      console.log("Container width:", cWidth, "Content width:", sWidth);
    }
  }, [orbits]);

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    console.log("Pan event:", info.offset.x);
    const newX = info.offset.x;
    const maxX = 0;
    const minX = -(contentWidth - containerWidth);

    let setX;
    if (newX > maxX) {
      setX = maxX + (newX - maxX) * resistance;
    } else if (newX < minX) {
      setX = minX + (newX - minX) * resistance;
    } else {
      setX = newX;
    }
    console.log("Setting x to:", setX);
    x.set(setX);
  };

  const handlePanStart = (event: any) => {
    controls.stop();
  };
  
  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    console.log("Pan end event:", info.velocity.x);
    const currentX = x.get();
    const velocity = info.velocity.x;

    console.log("Current x:", currentX, "Velocity:", velocity);

    if (currentX > threshold || (velocity > 500 && currentX > 0)) {
      setCounter((prev) => {
        const newCount = prev + 1;
        console.log("Crossed right threshold. Counter:", newCount);
        return newCount;
      });
      x.set(0);
    } else if (currentX < -threshold || (velocity < -500 && currentX < 0)) {
      setCounter((prev) => {
        const newCount = prev - 1;
        console.log("Crossed left threshold. Counter:", newCount);
        return newCount;
      });
      x.set(-(contentWidth - containerWidth));
    } else {
      const targetX = currentX > -(contentWidth - containerWidth) / 2 ? 0 : -(contentWidth - containerWidth);
      console.log("Settling to:", targetX);
      x.set(targetX);
    }
  };

  console.log("Rendering with counter:", counter);

  return (
    <div ref={containerRef} className="vis-move-lateral-container" style={{ overflow: "hidden" }}>
      <motion.div
        drag="x"
        dragConstraints={{ left: -(contentWidth - containerWidth), right: 0 }}
        dragElastic={0.2}
        style={{ x, display: "flex", cursor: "grab" }}
        onPan={handlePan}
        onPanStart={handlePanStart}
        animate={controls}
        onPanEnd={handlePanEnd}
      >
        {orbits.map((orbit, idx) => (
          <OrbitPill key={idx} name={orbit.orbitName} scale={orbit.orbitScale} />
        ))}
      </motion.div>
    </div>
  );
};
export default VisMovementLateral;