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
 * Props for the SwipeUpScreenTab component
 * @extends BaseSwipeTabProps
 */
interface SwipeUpScreenTabProps extends BaseSwipeTabProps {
  /** Optional callback when tab expansion state changes */
  onExpansionChange?: (isExpanded: boolean) => void;
}

/**
 * A swipeable tab component that can expand to fill the screen
 * @component
 * 
 * @example
 * ```tsx
 * <SwipeUpScreenTab
 *   verticalOffset={-35}
 *   useViewportHeight={true}
 *   onExpansionChange={(isExpanded) => console.log('Tab expanded:', isExpanded)}
 * >
 *   {({ bindDrag }) => (
 *     <div>
 *       <div className="handle"><span /></div>
 *       <div>Content goes here</div>
 *     </div>
 *   )}
 * </SwipeUpScreenTab>
 * ```
 */
const SwipeUpScreenTab: React.FC<SwipeUpScreenTabProps> = ({
  verticalOffset,
  children,
  useViewportHeight = false,
  onExpansionChange
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);

  // Calculate positions
  const initialY = calculateInitialY(verticalOffset, useViewportHeight);
  const finalY = -16; // 16px padding from top

  const y = useMotionValue(initialY);
  const controls = useAnimation();

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }

    // Monitor motion value for expansion state
    const unsubscribe = y.onChange(latest => {
      const newIsExpanded = Math.abs(latest - finalY) < 1;
      if (newIsExpanded !== isFullyExpanded) {
        setIsFullyExpanded(newIsExpanded);
        onExpansionChange?.(newIsExpanded);
      }
    });

    return () => unsubscribe();
  }, [finalY, y, isFullyExpanded, onExpansionChange]);

  const handlePanStart = (event: any) => {
    setIsDragging(true);
    controls.stop();
  };

  const handlePan = (event: any, info: PanInfo) => {
    const newY = constrainY(
      initialY + info.offset.y,
      finalY,
      initialY
    );
    y.set(newY);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const currentY = y.get();
    const threshold = initialY / 2;
    const willOpen = shouldTabOpen(info.velocity.y, currentY, threshold);

    controls.start({
      y: willOpen ? finalY : initialY,
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
    <div className="swipe-up-screen-container">
      <motion.div
        ref={ref}
        style={{ y }}
        className={`swipe-up-screen-tab-container ${isFullyExpanded ? 'fully-expanded' : ''}`}
        initial={{ y: initialY }}
        animate={controls}
        drag="y"
        dragConstraints={{
          top: finalY,
          bottom: initialY
        }}
        dragElastic={0.2}
        onPointerDownCapture={stopPropagation}
      >
        {children({ bindDrag })}
      </motion.div>
    </div>
  );
};

export default SwipeUpScreenTab;