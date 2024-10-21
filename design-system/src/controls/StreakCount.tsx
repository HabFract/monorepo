import React from "react";

import "./common.css";
import Progress from "antd/es/progress";
import { Frequency } from "@ui/src/state";
import { SEA_GREEN } from "../../colour-palette";

export interface StreakCountProps {
  currentStreak: number;
  longestStreak?: number;
  orbitFrequency: Frequency.Rationals;
}

const StreakCount: React.FC<StreakCountProps> = ({
  currentStreak,
  orbitFrequency,
  longestStreak = 100
}) => {

  function getFrequencyText(orbitFrequency: number): string {
    switch (orbitFrequency) {
      case Frequency.LESS_THAN_DAILY.WEEKLY:
        return "Weekly"
      case Frequency.LESS_THAN_DAILY.MONTHLY:
        return "Monthly"
      case Frequency.LESS_THAN_DAILY.QUARTERLY:
        return "Quarterly"
      default:
        return "Daily"
    }
  }
  const frequencyParts = getFrequencyText(orbitFrequency).split('-');

  return (
    <div className={currentStreak == longestStreak ? "streak-count-container winning" : "streak-count-container"}>
      <div className={"title"}>
        <span className="text-white">{frequencyParts.length > 1 ? <>{`${frequencyParts[0]}`}<sup>{frequencyParts[1]}</sup></> : frequencyParts[0]} Streak</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.773-.476a5.977 5.977 0 0 1 .572-2.759 6.026 6.026 0 0 1 2.486-2.665c.247-.14.55-.016.677.238A6.967 6.967 0 0 0 13.5 4.938ZM14 12a4 4 0 0 1-4 4c-1.913 0-3.52-1.398-3.91-3.182-.093-.429.44-.643.814-.413a4.043 4.043 0 0 0 1.601.564c.303.038.531-.24.51-.544a5.975 5.975 0 0 1 1.315-4.192.447.447 0 0 1 .431-.16A4.001 4.001 0 0 1 14 12Z" clipRule="evenodd" />
        </svg>
      </div>
      <Progress
        type="circle"
        percent={100}
        steps={{ count: currentStreak, gap: 4 }}
        strokeWidth={10}
        format={() => <span className="streak-control-indicator">{currentStreak}</span>}
        showInfo={true}
        strokeColor={SEA_GREEN}
        size={"small"}
      />
    </div>
  );
};

export default StreakCount;