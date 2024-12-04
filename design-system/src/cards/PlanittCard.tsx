import React from "react";
import "./common.css";
import "../buttons/common.css";
import { Orbit, Scale } from "../generated-types";
import { Button, getIconForPlanetValue, getIconSvg } from "..";
import { ListGroup, Popover } from "flowbite-react";
import FrequencyIndicator, { getFrequencyDisplayNameLong } from "../icons/FrequencyIndicator";
import { decodeFrequency } from "@ui/src/state";
import { darkThemeListGroup } from "../darkTheme";

export interface PlanittCardProps {
  orbit: Orbit;
  runDelete?: () => void;
  handleEditPlanitt?: () => void;
  currentStreak: number;
  longestStreak: number;
  lastTrackedWinDate: string
};

export function getScaleDisplayName(scale: Scale) {
  switch (scale) {
    case Scale.Astro:
      return "Star";
    case Scale.Sub:
      return "Giant";
    case Scale.Atom:
      return "Dwarf";
  }
}

const PlanittCard: React.FC<PlanittCardProps> = ({
  orbit,
  runDelete,
  handleEditPlanitt,
  currentStreak,
  longestStreak,
  lastTrackedWinDate
}: PlanittCardProps) => {
  const { id, name, metadata, scale, frequency } = orbit;
  const spin = 'positive';
  return (
    <article className={"card planitt-card"}>
      <header>
        <div className="planitt-card-title">
          <div className={`${scale.toLowerCase()} planitt-scale-image`}>{getIconForPlanetValue(scale)({})}</div>
          <h1 className="card-name">{name}</h1>
        </div>

        <Popover
          content={<ListGroup theme={darkThemeListGroup} className="list-group-override w-48">
            <ListGroup.Item onClick={handleEditPlanitt} icon={getIconSvg('pencil')}>Edit</ListGroup.Item>
            <span className="list-item-danger text-danger">
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
          <div>Spin</div>
          <div><img className="w-6 h-6 text-red-200" alt ="Planitt Spin" src={`/assets/icons/${spin}-spin.svg`} /></div>
        </div>
        <div>
          <div>Scale</div>
          <div>{getScaleDisplayName(scale)}</div>
        </div>
        <div>
          <div className="flex items-center gap-2"><FrequencyIndicator size="sm" frequency={decodeFrequency(frequency)} /> Frequency</div>
          <div>
            {getFrequencyDisplayNameLong(decodeFrequency(frequency))}
          </div>
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

export default PlanittCard;
