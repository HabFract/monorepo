import React from "react";

import "./common.css";

export interface VisMovementLateralProps {
  id: string;
  completed: boolean;
  toggleIsCompleted: () => void;
  size?: "main" | "secondary";
}

const VisMovementLateral: React.FC<VisMovementLateralProps> = ({
  id,
  completed,
  toggleIsCompleted,
  size,
}) => {
  return (
    <div className="vis-move-lateral-container">

    </div>
  );
};

export default VisMovementLateral;