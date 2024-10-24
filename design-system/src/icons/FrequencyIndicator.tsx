import "./common.css";
import { Frequency } from "@ui/src/state/types";

export interface FrequencyIndicatorProps {
  frequency: Frequency.Rationals
  size: "sm" | "md" | "lg"
}

const FrequencyIndicator: React.FC<FrequencyIndicatorProps> = ({
  frequency,
  size
}: FrequencyIndicatorProps) => {
  const displayFreq = getFrequencyDisplayName(frequency);
  return (
    <div className={`frequency-indicator-container ${size}`}>
      <span className={displayFreq.length > 3 ? "tracking-narrower" : ""}>{displayFreq}</span>
    </div>
  );
};

export default FrequencyIndicator;

export function getFrequencyDisplayName(freq: Frequency.Rationals): String {
  switch (freq) {
    case Frequency.ONE_SHOT:
      return '1';
    case Frequency.DAILY_OR_MORE.DAILY:
      return 'D';
    case Frequency.DAILY_OR_MORE.TWO:
      return '2 d';
    case Frequency.DAILY_OR_MORE.THREE:
      return '3 d';
    case Frequency.DAILY_OR_MORE.FOUR:
      return '4 d';
    case Frequency.DAILY_OR_MORE.FIVE:
      return '5 d';
    case Frequency.DAILY_OR_MORE.SIX:
      return '6 d';
    case Frequency.DAILY_OR_MORE.SEVEN:
      return '7 d';
    case Frequency.DAILY_OR_MORE.EIGHT:
      return '8 d';
    case Frequency.DAILY_OR_MORE.NINE:
      return '9 d';
    case Frequency.DAILY_OR_MORE.TEN:
      return '10 d';
    case Frequency.LESS_THAN_DAILY.WEEKLY:
      return 'W';
    case Frequency.LESS_THAN_DAILY.MONTHLY:
      return 'M';
    case Frequency.LESS_THAN_DAILY.QUARTERLY:
      return 'Q';
    default:
      return '-';
  }
}
