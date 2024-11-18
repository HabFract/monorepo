import React from "react";
import "./common.css";
import "../buttons/common.css";
import { Sphere } from "../generated-types";
import { Button, Calendar, getIconSvg } from "..";
import { DateTime } from "luxon";
import { ListGroup, Popover } from "flowbite-react";
import { darkThemeListGroup } from "../darkTheme";

export interface SystemCalendarProps {
  sphere: Sphere;
  runDelete?: () => void;
  setSphereIsCurrent: () => void;
  currentDate: DateTime<true>,
  currentWins: any,
  handleVisAction?: () => void;
  handleListAction?: () => void;
};

const SystemCalendar: React.FC<SystemCalendarProps> = ({
  sphere,
  runDelete,
  handleListAction,
  handleVisAction,
  currentDate,
  currentWins,
  setSphereIsCurrent,
}: SystemCalendarProps) => {
  const { name, metadata, id } = sphere;

  return (
    <article className={"card system-calendar-card"}>
      <header>
        <img src={sphere.metadata?.image as string || ""} />
        <h1 className="card-name">{name}</h1>
      </header>
      <section>
        <Calendar currentDate={currentDate} orbitFrequency={1} setNewDate={() => { }} orbitWins={currentWins || {}}></Calendar>
      </section>
      <footer>
        <Popover
          content={<ListGroup
            theme={darkThemeListGroup}
            className="w-48">
            <ListGroup.Item onClick={handleListAction} icon={getIconSvg('list')}>List Plannits</ListGroup.Item>
          </ListGroup>
          }
        >
          <Button onClick={setSphereIsCurrent} variant="circle-icon-lg btn-neutral outlined" icon={getIconSvg('more')({}) as any}></Button>
        </Popover>
        <Button onClick={handleVisAction} variant="primary responsive">Visualise</Button>
      </footer>
    </article>
  );
};

export default SystemCalendar;
