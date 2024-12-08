import React, { useState } from "react";
import "./common.css";
import "../buttons/common.css";
import { Sphere } from "../generated-types";
import { Button, Calendar, getIconForPlanetValue, getIconSvg, Spinner } from "..";
import { DateTime } from "luxon";
import { ListGroup, Popover } from "flowbite-react";
import { darkThemeListGroup } from "../darkTheme";
import { Frequency, OrbitNodeDetails, WinDataPerOrbitNode } from "@ui/src/state";

export interface SystemCalendarProps {
  sphere: Sphere;
  loading: boolean;
  rootOrbitWinData: (WinDataPerOrbitNode & { useRootFrequency?: boolean, leafDescendants?: number }) | null;
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
  const useOriginalFrequency = !!rootOrbitWinData?.useRootFrequency;
  const calculatedFrequency = (useOriginalFrequency ? rootOrbitOrbitDetails?.frequency : rootOrbitWinData?.leafDescendants as Frequency.Rationals) || Frequency.DAILY_OR_MORE.DAILY;

  const [currentDate, setCurrentDate] = useState(DateTime.now());
  return (
    <article className={"card system-calendar-card"}>
      {loading
        ? (<div style={{height: '204px'}}>
          <header>
          </header>
          <section>
            <Spinner type="card"></Spinner>
          </section>
        </div>)
        : (<>
          <header>
            <img src={sphere.metadata?.image as string || ""} />
            <h1 className="card-name">{name}</h1>
          </header>
          <section>
            <Calendar
              currentDate={currentDate}
              orbitFrequency={calculatedFrequency}
              setNewDate={setCurrentDate}
              orbitWins={rootOrbitWinData || {}}
              disabled={!hasData}
            />
            <div className="dark:bg-surface-elevated-dark rounded-2xl flex justify-between gap-2 py-2 pl-2 pr-4 mt-4">
              {rootOrbitOrbitDetails?.scale && <h1 className="root-orbit-label opacity-75">{getIconForPlanetValue(rootOrbitOrbitDetails.scale)({})}</h1>}<h2 className="root-orbit-name w-full text-center">
                {hasData
                  ? rootOrbitOrbitDetails.name
                  : "No Planitt data for this Space"}
              </h2>
            </div>
          </section>
        </>)}
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
