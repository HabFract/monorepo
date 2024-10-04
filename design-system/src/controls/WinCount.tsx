import React, { ReactNode, useEffect, useMemo, useState } from "react";

import "./common.css";
import { Frequency } from "@ui/src/state";
import { SAVE_WINS_FREQUENCY } from "@ui/src/components/vis/constants";
import Progress, { ProgressProps } from "antd/es/progress";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Spinner } from "flowbite-react";
import { OPAL, SEA_GREEN } from "../../colour-palette";

export interface WinCountProps {
  handleSaveWins: () => void;
  currentWins?: number;
  orbitFrequency?: Frequency.Rationals;
}

const twoColors: ProgressProps['strokeColor'] = {
  '0%': OPAL,
  '100%': SEA_GREEN,
};

const WinCount: React.FC<WinCountProps> = ({
  handleSaveWins,
  currentWins,
  orbitFrequency
}): ReactNode => {
  if (!currentWins || typeof currentWins !== 'number') {
    console.warn("Win tracking component fed bad props")
    return <Spinner aria-label="Loading!" className="menu-spinner" size="xl" />
  };
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
    <div className="win-count-container">
      <span className="title">Wins</span>
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