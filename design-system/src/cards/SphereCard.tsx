import React from "react";
import "./common.css";
import { OrderedListOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { SphereVis } from "../vis";
import { Scale, Sphere } from "../generated-types";
import { Button, Dropdown } from "flowbite-react";
import TreeVisIcon from "@ui/src/components/icons/TreeVisIcon";
import Exclaim from "@ui/src/components/icons/Exclaim";
import { HelperText } from "../copy";

export type SphereCardProps = {
  sphere: Sphere;
  isHeader: boolean;
  orbitScales: Scale[];
  transition?: (newState: string, params?: object) => void;
  runDelete?: () => void;
  setSphereIsCurrent?: () => void;
  showToast?: (message: string, duration: number) => void;
  hasCachedNodes?: boolean
};

function calculateSpherePercentages(counts: object): any {
  const total = Object.values(counts).reduce(
    (acc: number, count: number) => acc + count,
    0,
  );
  return Object.entries(counts).reduce(
    (acc: object, [scale, count]: [string, number]) => {
      acc[scale] = (count / total) * 100;
      return acc;
    },
    { Sub: 0, Atom: 0, Astro: 0 },
  );
}

function calculateSphereCounts(orbitScales: Scale[]) {
  return orbitScales.reduce(
    (acc: object, orbitScale: Scale) => {
      switch (orbitScale) {
        case Scale.Sub:
          acc["Sub"] += 1;
          break;
        case Scale.Atom:
          acc["Atom"] += 1;
          break;
        case Scale.Astro:
          acc["Astro"] += 1;
          break;
      }
      return acc;
    },
    { Sub: 0, Atom: 0, Astro: 0 },
  );
}

const SphereCard: React.FC<SphereCardProps> = ({
  sphere,
  isHeader,
  orbitScales,
  transition,
  runDelete,
  showToast,
  setSphereIsCurrent,
  hasCachedNodes
}: SphereCardProps) => {
  const { name, metadata, id } = sphere;

  function routeToVis() {
    if (!hasCachedNodes) {
      showToast!(
        "Select a Sphere with Orbits to enable Visualisation for that Sphere",
        100000,
      );
      return;
    }
    transition?.("Vis", {
      currentSphereEhB64: sphere.eH,
      currentSphereAhB64: id,
    });
  }
  return (
    <div className={isHeader ? "sphere-card list-header" : "sphere-card"}>
      <header className={"sphere-header card-header"}>
        <div className="sphere-title">
          <h2 className="card-name card-h1">{name}</h2>
        </div>
        {/* <div className="sphere-timeframe col-c text-sm p-1">
          <span className="font-semibold">Last tracked:</span>
          <p>{}</p>
        </div> */}
      </header>
      <section className="card-body-bg sphere-card col-c">
        <div className="sphere-description flex items-center justify-center">
          {metadata?.description && metadata?.description !== "" && (
            <p className="card-copy">{metadata.description}</p>
          )}
        </div>
        <div className="card-actions">
          <div className="sphere-actions-vis col-c w-full"
            onClick={setSphereIsCurrent}
          >
            {!isHeader && (
              <Dropdown
                label="Actions"
                dismissOnClick={false}
                className="bg-secondary p-2"
              >
                <Dropdown.Item
                  onClick={() => {
                    transition?.("ListOrbits", { sphereAh: id });
                  }}
                >
                  <OrderedListOutlined className="icon" />
                  <span>List Orbits</span>
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    transition?.("CreateOrbit", { sphereEh: sphere.eH });
                  }}
                >
                  <PlusCircleOutlined className="icon" />
                  <span>Create Orbit</span>
                </Dropdown.Item>
                <Dropdown.Item onClick={routeToVis}>
                  <TreeVisIcon />
                  <span>Visualise</span>
                </Dropdown.Item>
                {/* <Dropdown.Item onClick={() => {transition('CreateSphere', { editMode: true, sphereToEditId: sphere.id })}}>
              <span>
                <EditOutlined className="icon" />
                Edit
              </span>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => {runDelete()}}>
              <span>
                <DeleteOutlined className="icon" />
                Delete
              </span>
            </Dropdown.Item> */}
              </Dropdown>
            )}
          </div>
        </div>
        {isHeader && orbitScales.length > 0 ? (
          <div className="mini-vis col-c flex-1">
            <SphereVis
              spherePercentages={calculateSpherePercentages(
                calculateSphereCounts(orbitScales),
              )}
            />
          </div>
        ) : (
          isHeader && (
            <div style={{ position: "relative", top: "-1.25rem" }}>
              <div className="px-2">
                <HelperText
                  title={"Cannot Visualise"}
                  titleIcon={<Exclaim />}
                  withInfo={false}
                >
                  You don't have any Orbits to visualise, yet. Create some by
                  clicking 'Create Orbit'
                </HelperText>
              </div>
            </div>
          )
        )}
      </section>
      {isHeader && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              transition?.("CreateOrbit", { sphereEh: sphere.eH });
            }}
            className="btn mt-2 btn-secondary add-orbit border-0 w-full"
            size="sm"
          >
            <PlusCircleOutlined className="icon" />
            <span>Create Orbit</span>
          </Button>
          <Button
            className="btn responsive btn-primary w-full"
            size="sm"
            onClick={routeToVis}
          >
            <TreeVisIcon />
            <span>Visualise</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SphereCard;
