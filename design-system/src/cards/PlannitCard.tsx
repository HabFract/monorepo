import React from "react";
import "./common.css";
import "../buttons/common.css";
import { Orbit } from "../generated-types";
import { Button, Calendar, getIconForPlanetValue, getIconSvg } from "..";
import { DateTime } from "luxon";
import { ListGroup, Popover, Table } from "flowbite-react";
import { getFrequencyDisplayName } from "../icons/FrequencyIndicator";
import { decodeFrequency } from "@ui/src/state";
import { darkThemeListGroup } from "../darkTheme";

export interface PlannitCardProps {
  orbit: Orbit;
  runDelete?: () => void;
  handleEditPlannit?: () => void;
  currentStreak: number;
  longestStreak: number;
  lastTrackedWinDate: string
};

const PlannitCard: React.FC<PlannitCardProps> = ({
  orbit,
  runDelete,
  handleEditPlannit,
  currentStreak,
  longestStreak,
  lastTrackedWinDate
}: PlannitCardProps) => {
  const { id, name, metadata, scale, frequency } = orbit;

  return (
    <article className={"plannit-card"}>
      <header>
        <div className="plannit-card-title">
          <div className={`${scale.toLowerCase()} plannit-scale-image`}>{getIconForPlanetValue(scale)({})}</div>
          <h1 className="card-name">{name}</h1>
        </div>

        <Popover
          content={<ListGroup theme={darkThemeListGroup} className="w-48">
            <ListGroup.Item onClick={handleEditPlannit} icon={getIconSvg('pencil')}>Edit</ListGroup.Item>
            <span className="text-danger">
              <ListGroup.Item onClick={runDelete} icon={getIconSvg('trash')}>Delete</ListGroup.Item>
            </span>
          </ListGroup>
          }
        >
          <Button variant="circle-icon btn-neutral" icon={getIconSvg('more')({}) as any}></Button>
        </Popover>
      </header>
      <section className="stats">
        <div>
          <div>Scale</div>
          <div>{scale}</div>
        </div>
        <div>
          <div>Frequency</div>
          <div>{getFrequencyDisplayName(decodeFrequency(frequency))}</div>
        </div>
        <div>
          <div className="flex items-center gap-2"><span>{getIconSvg('fire')({})}</span><span>Current Streak</span></div>
          <div>{currentStreak}</div>
        </div>
        <div>
          <div className="flex items-center gap-2"><span>{getIconSvg('fire')({})}</span><span>Longest Streak</span></div>
          <div>{longestStreak}</div>
        </div>
      </section>
      <footer>
        Last tracked: {lastTrackedWinDate}
      </footer>
    </article>
  );
};

export default PlannitCard;
