import React, { ReactNode, useEffect, useMemo, useState } from "react";

import "./common.css";
import { SAVE_WINS_FREQUENCY } from "@ui/src/components/vis/constants";
import Progress, { ProgressProps } from "antd/es/progress";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Spinner } from "flowbite-react";
import { OPAL, SEA_GREEN } from "../../colour-palette";
import { Frequency } from "@ui/src/graphql/generated";
import { decodeFrequency } from "@ui/src/state";
import FrequencyIndicator from "../icons/frequency-indicator";

export interface WinCountProps {
  handleSaveWins: () => void;
  currentWins?: number;
  orbitFrequency?: Frequency;
}

const twoColors: ProgressProps['strokeColor'] = {
  '0%': OPAL,
  '100%': SEA_GREEN,
};

const WinCount: React.FC<WinCountProps> = ({
  handleSaveWins,
  currentWins,
  orbitFrequency: rawFreq
}): ReactNode => {
  if (typeof currentWins == 'undefined' || typeof currentWins !== 'number') {
    console.warn("Win tracking component fed bad props")
    return <Spinner aria-label="Loading!" className="menu-spinner" size="xl" />
  };
  const orbitFrequency = decodeFrequency(rawFreq!);
  const [winCount, setWinCount] = useState<number>(currentWins);
  const [savedWinCount, setSavedWinCount] = useState<number>(currentWins);
  const winPercent = useMemo(() => (100) * (winCount / orbitFrequency!), [winCount]);
  const savedWinPercent = useMemo(() => (100) * (savedWinCount / orbitFrequency!), [savedWinCount]);

  const lowerLimitMet = useMemo(() => winCount <= 0, [winCount]);
  const upperLimitMet = useMemo(() => winCount >= orbitFrequency!, [winCount]);
  const incrementWins = () => {
    if (upperLimitMet) return;
    setWinCount(winCount + 1);
  }
  const decrementWins = () => {
    if (lowerLimitMet) return;
    setWinCount(winCount - 1);
  }
  useEffect(() => {
    const saveToSourceChain = setInterval((() => {
      if (savedWinPercent !== winPercent) {
        handleSaveWins();
        setSavedWinCount(winCount)
      }

    }), SAVE_WINS_FREQUENCY);

    return () => clearInterval(saveToSourceChain);
  }, [savedWinPercent, winPercent, winCount, handleSaveWins]);

  return (
    <div className={orbitFrequency == winCount ? "win-count-container winning" : "win-count-container"}>
      <div className="title">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
        </svg>
        <span className="text-white"> / </span>
        <FrequencyIndicator frequency={rawFreq!} size="md" />
      </div>
      {orbitFrequency! > 0
        ? <button type="button" disabled={lowerLimitMet} className="win-control minus" onClick={decrementWins}>
          <MinusCircleOutlined />
        </button>
        : <span className="spacer" />
      }
      <Progress
        percent={winPercent}
        format={(_percent, _successPercent) =>
          <span className="win-control-indicator">{winCount}/{orbitFrequency}</span>
        }
        size={"small"}
        type="circle" 
        className="text-center text-sm"
        strokeColor={twoColors}
      />
      {orbitFrequency! > 0
        ? <button type="button" disabled={upperLimitMet} className="win-control plus" onClick={incrementWins}>
          <PlusCircleOutlined />
        </button>
        : <span className="spacer" />
      }
    </div>
  );
};

export default WinCount;