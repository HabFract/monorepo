import React, { useState } from "react";
import "./common.css";
import "../buttons/common.css";
import { Frequency, Orbit, Sphere } from "../generated-types";
import { Button, Calendar, getIconForPlanetValue, getIconSvg, Spinner } from "..";
import { DateTime } from "luxon";
import { ListGroup, Popover } from "flowbite-react";
import { darkThemeListGroup } from "../darkTheme";
import { OrbitNodeDetails, WinDataPerOrbitNode } from "@ui/src/state";

export interface SystemCalendarProps {
  sphere: Sphere;
  loading: boolean;
  rootOrbitWinData: WinDataPerOrbitNode | null;
  rootOrbitOrbitDetails: OrbitNodeDetails | null;
  runDelete?: () => void;
  setSphereIsCurrent: () => void;
  handleVisAction: () => void;
  handleCreateAction: () => void;
  handleListAction: () => void;
};

const SystemCalendar: React.FC<SystemCalendarProps> = ({
  sphere,
  loading,
  rootOrbitWinData,
  rootOrbitOrbitDetails,
  runDelete,
  handleListAction,
  handleCreateAction,
  handleVisAction,
  setSphereIsCurrent,
}: SystemCalendarProps) => {
  const { name } = sphere;
  // Local date state for this calendar
  const hasData = rootOrbitWinData && rootOrbitOrbitDetails;
  const [currentDate, setCurrentDate] = useState(DateTime.now());
  return (
    loading ? <article className={"card system-calendar-card"}>
      <Spinner type="card"></Spinner>
    </article>
      : <article className={"card system-calendar-card"}>
        <header>
          <img src={sphere.metadata?.image as string || ""} />
          <h1 className="card-name">{name}</h1>
        </header>
        <section>
          <Calendar
            currentDate={currentDate}
            orbitFrequency={1}
            setNewDate={setCurrentDate}
            orbitWins={rootOrbitWinData || {}}
            disabled={!hasData}
          />
          <div className="dark:bg-surface-elevated-dark rounded-2xl flex justify-between gap-2 py-2 pl-2 pr-4 mt-4">
              {rootOrbitOrbitDetails?.scale && <h1 className="root-orbit-label opacity-75">{getIconForPlanetValue(rootOrbitOrbitDetails.scale)({})}</h1> }<h2 className="root-orbit-name">
              {hasData
                ? rootOrbitOrbitDetails.name
                : "No root orbit data available"}
            </h2>
          </div>
        </section>
        <footer>
          <Popover
            content={<ListGroup
              theme={darkThemeListGroup}
              className="list-group-override w-48">
              <ListGroup.Item onClick={() => handleListAction()} icon={getIconSvg('list')}>List Planitts</ListGroup.Item>
              <ListGroup.Item onClick={() => handleCreateAction()} icon={getIconSvg('plus')}>Add Planitt</ListGroup.Item>
            </ListGroup>
            }
          >
            <Button onClick={() => setSphereIsCurrent()} variant="circle-icon-lg btn-neutral outlined" icon={getIconSvg('more')({}) as any}></Button>
          </Popover>
          <Button onClick={() => handleVisAction()} variant="primary responsive">Visualise</Button>
        </footer>
      </article>
  );
};

export default SystemCalendar;
