import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import {
  BaseSwipeTabProps,
  BindDragProps,
  stopPropagation,
  calculateInitialY,
  springConfig,
  shouldTabOpen,
  constrainY
} from './swipe-tab-utils';
import './common.css';

/**
 * Props for the SwipeUpTab component
 * @extends BaseSwipeTabProps
 */
interface SwipeUpTabProps extends BaseSwipeTabProps {
  /** Elements to be rendered relative to the tab position */
  relativeElements: React.ReactNode;
}

/**
 * A swipeable tab component that maintains relative positioning with other elements
 * @component
 * 
 * @example
 * ```tsx
 * <SwipeUpTab
 *   verticalOffset={-35}
 *   useViewportHeight={true}
 *   relativeElements={<div>Relative content</div>}
 * >
 *   {({ bindDrag }) => (
 *     <div>
 *       <div className="handle"><span /></div>
 *       <div>Tab content goes here</div>
 *     </div>
 *   )}
 * </SwipeUpTab>
 * ```
 */
const SwipeUpTab: React.FC<SwipeUpTabProps> = ({
  verticalOffset,
  relativeElements,
  children,
  useViewportHeight = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Calculate initial position
  const initialY = calculateInitialY(verticalOffset, useViewportHeight);
  const y = useMotionValue(initialY);
  const controls = useAnimation();

  useEffect(() => {
    if (ref.current) {
      const newHeight = ref.current.offsetHeight;
      setHeight(newHeight);

      const unsubscribe = y.on("change", (value) => {
        y.set(newHeight - initialY);
      });

      // Cleanup subscription
      return () => unsubscribe();
    }
  }, [y, initialY]);

  const handlePanStart = (event: any) => {
    controls.stop();
  };

  const handlePan = (event: any, info: PanInfo) => {
    const newY = constrainY(
      initialY + info.offset.y,
      0,
      initialY
    );
    y.set(newY);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    const currentY = y.get();
    const threshold = initialY / 2;
    const willOpen = shouldTabOpen(info.velocity.y, currentY, threshold);

    controls.start({
      y: willOpen ? 0 : height - initialY,
      transition: {
        ...springConfig,
        velocity: info.velocity.y
      }
    });
  };

  const bindDrag: BindDragProps = {
    onPanStart: handlePanStart,
    onPan: handlePan,
    onPanEnd: handlePanEnd,
  };

  return (
    <div className="swipe-up-container">
      <motion.div className="relative" style={{ y }}>
        <div className="relative-controls-container">
          {relativeElements}
        </div>
      </motion.div>
      <motion.div
        ref={ref}
        style={{ y }}
        className="swipe-up-tab-container"
        initial={{ y: initialY }}
        animate={controls}
        drag="y"
        dragConstraints={{
          top: -height + verticalOffset,
          bottom: 130
        }}
        dragElastic={0.2}
        onPointerDownCapture={stopPropagation}
      >
        {children({ bindDrag })}
      </motion.div>
    </div>
  );
};

export default SwipeUpTab;