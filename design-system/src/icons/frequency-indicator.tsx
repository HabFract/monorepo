import { useState } from "react";
import "./common.css";
import { Frequency } from "../generated-types";

export interface FrequencyIndicatorProps {
  frequency: Frequency
  size: "sm" | "md" | "lg"
}

const FrequencyIndicator: React.FC<FrequencyIndicatorProps> = ({
  frequency,
  size
}: FrequencyIndicatorProps) => {
  const displayFreq = getFrequencyDisplayName(frequency);
  return (
    <div className={`frequency-indicator-container ${size}`}>
      <span className={displayFreq.length > 3 ? "tracking-narrower": ""}>{displayFreq}</span>
    </div>
  );
};

export default FrequencyIndicator;

export function getFrequencyDisplayName(freq: Frequency) {
  switch (freq) {
    case Frequency.OneShot:
      return '1';
    case Frequency.DailyOrMore_1d:
      return 'D';
    case Frequency.DailyOrMore_2d:
      return '2 d';
    case Frequency.DailyOrMore_3d:
      return '3 d';
    case Frequency.DailyOrMore_4d:
      return '4 d';
    case Frequency.DailyOrMore_5d:
      return '5 d';
    case Frequency.DailyOrMore_6d:
      return '6 d';
    case Frequency.DailyOrMore_7d:
      return '7 d';
    case Frequency.DailyOrMore_8d:
      return '8 d';
    case Frequency.DailyOrMore_9d:
      return '9 d';
    case Frequency.DailyOrMore_10d:
      return '10 d';
    case Frequency.LessThanDaily_1w:
      return 'W';
    case Frequency.LessThanDaily_1m:
      return 'M';
    case Frequency.LessThanDaily_1q:
      return 'Q';
    default:
      return '-';
  }
}
