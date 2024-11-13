export { default as VisControls } from "./VisControls";
export { default as Calendar } from "./Calendar";
export { default as SwipeUpTab } from "./SwipeUpTab";
export { default as VisMovementVertical } from "./VisMovementVertical";
export { default as VisMovementLateral } from "./VisMovementLateral";
export { default as StreakCount } from "./StreakCount";
export { default as WinCount } from "./WinCount";
export { default as OverlayLayout } from "./OverlayLayout";

export const toYearDotMonth = (date: string) =>
  date.split("/").slice(1).reverse().join(".");
