import React from "react";

import "./common.css";

export interface VisMovementVerticalProps {
  id: string;
  completed: boolean;
  toggleIsCompleted: () => void;
  size?: "main" | "secondary";
}

const VisMovementVertical: React.FC<VisMovementVerticalProps> = ({
  id,
  completed,
  toggleIsCompleted,
  size,
}) => {
  return (
    <div className="vis-move-vertical-container">

    </div>
  );
};

export default VisMovementVertical;