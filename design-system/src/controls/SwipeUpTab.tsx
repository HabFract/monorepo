import React, { useEffect, useMemo, useRef, useState } from 'react';
import './common.css';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

interface SwipeUpTabProps {
  verticalOffset: number
  children: React.ReactNode;
}

const SwipeUpTab: React.FC<SwipeUpTabProps> = ({ verticalOffset, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  
  const tabShownHeight = useMemo(() => height - verticalOffset, [verticalOffset]); // Currently using a constant 65px value but this allows calculation relative to height
  const y = useMotionValue(height - tabShownHeight);
  console.log('height, tabShownHeight :>> ', height, tabShownHeight);
  const controls = useAnimation();
  
  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
      y.set(ref.current.offsetHeight - tabShownHeight);
    }
  }, [y]);

  const handleDrag = (event: any, info: any) => {
    const newY = Math.max(0, Math.min(height - tabShownHeight, height - tabShownHeight + info.offset.y));
    y.set(newY);
  };

  const handleDragEnd = (event: any, info: any) => {
    const velocity = info.velocity.y;
    const currentY = y.get();
    const threshold = height / 2;
    const shouldClose = velocity > 20 || (velocity >= 0 && currentY > threshold);

    if (shouldClose) {
      controls.start({ y: height - tabShownHeight });
    } else {
      controls.start({ y: 0 });
    }
  };

  return (
    <motion.div
      ref={ref}
      className={"swipe-up-tab-container"}
      drag="y"
      dragConstraints={{ top: 0, bottom: height - tabShownHeight }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ y: height - tabShownHeight }}
      animate={controls}
    >

<motion.div className="handle">
          <span></span>
        </motion.div>
      {children}
    </motion.div>
  );
};

export default SwipeUpTab;