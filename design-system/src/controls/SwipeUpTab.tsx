import React, { useEffect, useRef, useState } from 'react';
import './common.css';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';

interface BindDragProps {
  onPanStart: (event: any, info: PanInfo) => void;
  onPan: (event: any, info: PanInfo) => void;
  onPanEnd: (event: any, info: PanInfo) => void;
}
interface SwipeUpTabProps {
  verticalOffset: number;
  relativeElements: React.ReactNode;
  useViewportHeight?: boolean;
  children: (props: { bindDrag: BindDragProps }) => React.ReactNode;
}

export const stopPropagation = (event) => {
  // Bypass framermotion pan handling
  if (!(event.target.closest(".handle"))) {
    event.stopPropagation()
  }
}

const SwipeUpTab: React.FC<SwipeUpTabProps> = ({ verticalOffset, relativeElements, children, useViewportHeight = false  }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [height, setHeight] = useState(0);

  const initialY = useViewportHeight 
  ? -(window.innerHeight * (verticalOffset / 100))
  : -verticalOffset;
  const y = useMotionValue(initialY);

  const controls = useAnimation();

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
      y.set(ref.current.offsetHeight - initialY);
    }
  }, [y, initialY]);

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
    <div>
      <motion.div className="relative" style={{ y }}>
        <div className="relative-controls-container">{relativeElements}</div>
      </motion.div>
        <motion.div
          ref={ref}
          dragConstraints={{ top: -height + verticalOffset, bottom: 130 }}
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
    </div>
  );
};

export default SwipeUpTab;