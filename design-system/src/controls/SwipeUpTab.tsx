import React, { useEffect, useMemo, useRef, useState } from 'react';
import './common.css';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo, useSpring } from 'framer-motion';

interface BindDragProps {
  onPanStart: (event: any, info: PanInfo) => void;
  onPan: (event: any, info: PanInfo) => void;
  onPanEnd: (event: any, info: PanInfo) => void;

}
interface SwipeUpTabProps {
  verticalOffset: number;
  children: (props: { bindDrag: BindDragProps }) => React.ReactNode;
}

let initialX: number | null = null;
let initialY: number | null = null;
const moveThreshold = 5; // Minimum movement to determine direction

export const handlePointerDown = (event) => {
  initialX = event.clientX;
  initialY = event.clientY;
}
export const handlePointerMove = (event: React.PointerEvent) => {
  if (initialX === null || initialY === null) {
    return;
  }

  const currentX = event.clientX;
  const currentY = event.clientY;
  const diffX = Math.abs(currentX - initialX);
  const diffY = Math.abs(currentY - initialY);

  if (diffX > moveThreshold || diffY > moveThreshold) {
    if (diffX > diffY) {
      // Horizontal movement, allow propagation
      console.log("Horizontal movement detected, allowing propagation");
      // You might want to remove your event listeners here to stop checking
    } else {
      // Vertical movement, stop propagation
      console.log("Vertical movement detected, stopping propagation");
      event.stopPropagation();
    }

    // Reset initial positions
    initialX = null;
    initialY = null;
  }
};

export const handlePointerUp = () => {
  // Reset initial positions
  initialX = null;
  initialY = null;
};
export const stopPropagation = (event) => {
  // Bypass framermotion pan handling
  if (!(event.target.closest(".handle") || event.target.closest(".vis-move-lateral-container"))) {
    event.stopPropagation()
  } else {

    console.log('event :>> ', event);
  }
}

const SwipeUpTab: React.FC<SwipeUpTabProps> = ({ verticalOffset, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [height, setHeight] = useState(0);

  const initialY = -verticalOffset;
  const y = useMotionValue(initialY);

  const controls = useAnimation();

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
      y.set(ref.current.offsetHeight - initialY);
    }
  }, [y]);

  const handlePanStart = (event: any) => {
    controls.stop();
  };
  
  const handlePan = (event: any, info: PanInfo) => {
    const newY = Math.max(0, Math.min(initialY, initialY + info.offset.y));
    y.set(newY);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentY = y.get();
    const threshold = initialY / 2;
    const shouldOpen = velocity < -20 || (velocity <= 0 && currentY < threshold);

    if (shouldOpen) {
      controls.start({ y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
    } else {
      controls.start({ y: height - initialY, transition: { type: 'spring', stiffness: 400, damping: 30 } });
    }
  };

  const bindDrag: BindDragProps = {
    onPanStart: handlePanStart,
    onPan: handlePan,
    onPanEnd: handlePanEnd,
  };

  return (
    <motion.div      
      ref={ref}
      dragConstraints={{ top: -height + verticalOffset, bottom: 0 }}
      dragElastic={0.2}
      drag="y"
      style={{ y }}
      className={"swipe-up-tab-container"}
      initial={{ y: initialY }}
      animate={controls}
      onPointerDownCapture={stopPropagation}
    >
      {children({ bindDrag })}
    </motion.div>
  );
};

export default SwipeUpTab;