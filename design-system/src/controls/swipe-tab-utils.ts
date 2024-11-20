import { PanInfo } from 'framer-motion';

/**
 * Common props for drag event handlers
 */
export interface BindDragProps {
  /** Handler for when dragging starts */
  onPanStart: (event: any, info: PanInfo) => void;
  /** Handler for during drag motion */
  onPan: (event: any, info: PanInfo) => void;
  /** Handler for when drag ends */
  onPanEnd: (event: any, info: PanInfo) => void;
}

/**
 * Base props shared between SwipeUpTab and SwipeUpScreenTab
 */
export interface BaseSwipeTabProps {
  /** Vertical offset for the tab's initial position */
  verticalOffset: number;
  /** Whether to use viewport height for calculations */
  useViewportHeight?: boolean;
  /** Render prop for tab content */
  children: (props: { bindDrag: BindDragProps }) => React.ReactNode;
}

/**
 * Prevents event propagation unless the target is within a handle element
 * @param event - The pointer event to handle
 */
export const stopPropagation = (event: React.PointerEvent): void => {
  if (!(event.target as HTMLElement).closest(".handle")) {
    event.stopPropagation();
  }
};

/**
 * Calculate initial Y position based on offset and viewport settings
 * @param verticalOffset - The offset value
 * @param useViewportHeight - Whether to use viewport height calculations
 * @returns The calculated initial Y position
 */
export const calculateInitialY = (
  verticalOffset: number, 
  useViewportHeight: boolean
): number => {
  return useViewportHeight
    ? window.innerHeight * (verticalOffset / 100)
    : verticalOffset;
};

/**
 * Spring animation configuration for consistent transitions
 */
export const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

/**
 * Spring animation configuration for consistent transitions
 */
export const springConfigSnappy = {
  type: 'spring' as const,
  stiffness: 10000, // Increased from 400
  damping: 190,    // Increased from 30
  restDelta: 0.25, // Added to make it settle faster
  restSpeed: 0.25  // Added to make it settle faster
};
/**
 * Determines if the tab should open based on velocity and position
 * @param velocity - The vertical velocity of the motion
 * @param currentY - Current Y position
 * @param threshold - Threshold for determining open state
 * @returns Whether the tab should open
 */
export const shouldTabOpen = (
  velocity: number,
  currentY: number,
  threshold: number
): boolean => {
  return velocity < -20 || (velocity <= 0 && currentY < threshold);
};

/**
 * Constrains a Y value between minimum and maximum bounds
 * @param value - The value to constrain
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns The constrained value
 */
export const constrainY = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};