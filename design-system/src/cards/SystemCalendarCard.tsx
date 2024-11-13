import React from "react";
import "./common.css";
import { Sphere } from "../generated-types";
import { Button, Calendar, getIconSvg } from "..";
import { DateTime } from "luxon";
// import { Popover } from "flowbite-react";

export interface SystemCalendarProps {
  sphere: Sphere;
  runDelete?: () => void;
  transition?: (newState: string, params?: object) => void;
  setSphereIsCurrent?: () => void;
  currentDate: DateTime<true>,
  currentWins: any,
  showToast?: (message: string, duration: number) => void;
  hasCachedNodes?: boolean
};

const SystemCalendar: React.FC<SystemCalendarProps> = ({
  sphere,
  runDelete,
  transition,
  showToast,
  currentDate,
  currentWins,
  setSphereIsCurrent,
  hasCachedNodes
}: SystemCalendarProps) => {
  const { name, metadata, id } = sphere;

  function routeToVis() {
    if (!hasCachedNodes) {
      showToast!(
        "Select a Sphere with Orbits to enable Visualisation for that Sphere",
        100000,
      );
      return;
    }
    transition?.("Vis");
  }
  return (
    <article className={"system-calendar-card"}>
      <header>
        <img src={sphere.metadata?.image as string || ""} />
        <h1 className="card-name">{name}</h1>
      </header>
      <section>
      <Calendar currentDate={currentDate} orbitFrequency={1} setNewDate={() => {}} orbitWins={currentWins || {}}></Calendar>
      </section>
      <footer>
          <Button variant="circle-icon-lg btn-neutral outlined" icon={getIconSvg('more')({})}></Button>
        <Button variant="primary responsive">Visualise</Button>
      </footer>
    </article>
  );
};

export default SystemCalendar;
