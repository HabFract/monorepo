import React from "react";

import "./common.css";

export interface WinCountProps {
  id: string;
  completed: boolean;
  toggleIsCompleted: () => void;
  size?: "main" | "secondary";
}

const WinCount: React.FC<WinCountProps> = ({
  id,
  completed,
  toggleIsCompleted,
  size,
}) => {
  return (
    <div className="win-count-container">

    </div>
  );
};

export default WinCount;