import React from "react";

import "./common.css";

export interface StreakCountProps {
  id: string;
  completed: boolean;
  toggleIsCompleted: () => void;
  size?: "main" | "secondary";
}

const StreakCount: React.FC<StreakCountProps> = ({
  id,
  completed,
  toggleIsCompleted,
  size,
}) => {
  return (
    <div className="streak-count-container">

    </div>
  );
};

export default StreakCount;