import React from 'react';
import './common.css';
import { DeleteOutlined, EditOutlined, PieChartOutlined, OrderedListOutlined, PlusCircleFilled, PlusCircleOutlined } from '@ant-design/icons';
import { SphereVis } from '../vis';
import { Scale, Sphere } from '../../../ui/src/graphql/generated';
import { Button } from 'flowbite-react';
import { currentOrbitCoords, currentSphere } from '../../../ui/src/state/currentSphereHierarchyAtom';
import { SphereNodeDetailsCache, SphereOrbitNodes, nodeCache, store } from '../../../ui/src/state/jotaiKeyValueStore';
import TreeVisIcon from '../../../ui/src/components/icons/TreeVisIcon';
import Exclaim from '../../../ui/src/components/icons/Exclaim';
import { HelperText } from '../copy';

type SphereCardProps = {
  sphere: Sphere;
  isHeader: boolean;
  orbitScales: Scale[];
  transition: (newState: string, params?: object) => void
  runDelete?: () => void
};

function calculateSpherePercentages(counts: object) : any {
  const total = Object.values(counts).reduce((acc: number, count: number) => acc + count, 0);
  return Object.entries(counts).reduce((acc: object, [scale, count]: [string, number]) => {
    //@ts-ignore
    acc[scale] = count / total * 100;
    return acc;
  }, {Sub: 0, Atom: 0, Astro: 0});
}
function calculateSphereCounts(orbitScales: Scale[]) {
  return orbitScales.reduce((acc: object, orbitScale: Scale) => {
    switch (orbitScale) {
      case Scale.Sub:
        //@ts-ignore
        acc['Sub'] += 1;
        break;
      case Scale.Atom:
        //@ts-ignore
        acc['Atom'] += 1;
        break;
        case Scale.Astro:
          //@ts-ignore
        acc['Astro'] += 1;
        break;
    }
    return acc
  }, {Sub: 0, Atom: 0, Astro: 0});
}

const SphereCard: React.FC<SphereCardProps> = ({ sphere, isHeader, orbitScales, transition, runDelete } : SphereCardProps) => {
  const { name, metadata, id } = sphere;
  const sphereNodes = id && store.get(nodeCache.items) && store.get(nodeCache.items)![id as keyof SphereNodeDetailsCache] as SphereOrbitNodes;
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
          {metadata?.description && metadata?.description !== '' && <p className='card-copy'>{metadata.description}</p>}
        </div>
        <div className="card-actions">
          <div className="sphere-actions-vis col-c w-full">
            {!isHeader && <Button onClick={() => {
                store.set(currentSphere, {entryHash: sphere.eH, actionHash: sphere.id});
                transition('ListOrbits', { sphereAh: sphere.id })
            }} className="btn mt-2 responsive btn-neutral w-full" size="sm">
              <OrderedListOutlined className="icon" />
              <span>List Orbits</span>
            </Button>}

            {!isHeader && <Button onClick={() => {
              store.set(currentSphere, {entryHash: sphere.eH, actionHash: sphere.id});
              transition('CreateOrbit', { sphereEh: sphere.eH })
            }} className="btn responsive btn-secondary add-orbit border-0 w-full" size="sm">
              <PlusCircleOutlined className="icon" />
              <span>Create Orbit</span>
            </Button>}

            {!isHeader && <Button disabled={!sphereNodes || typeof sphereNodes == 'object' && !(Object.values(sphereNodes).length > 0)} className="btn responsive btn-primary w-full" size="sm" onClick={() => {
                store.set(currentSphere, {entryHash: sphere.eH, actionHash: sphere.id});
                store.set(currentOrbitCoords, {x: 0, y: 0});
                  transition('Vis', {currentSphereEhB64: sphere.eH, currentSphereAhB64: sphere.id })
                }}>
              <TreeVisIcon />
              <span>Visualise</span>
            </Button>}
          </div>
        </div>
        { isHeader && orbitScales.length > 0 
          ? <div className="mini-vis col-c flex-1">
            <SphereVis spherePercentages={calculateSpherePercentages(calculateSphereCounts(orbitScales))}/>
          </div>
          : isHeader && <div style={{ position: "relative", top: "-1.25rem" }}>
              <HelperText
                  title={"Cannot Visualise"}
                  titleIcon={<Exclaim />}
                  withInfo={false}
                >
                  You don't have any Orbits to visualise, yet. Create some by clicking 'Create Orbit'
                </HelperText>
            </div>
        }
      </section>
      {isHeader && <div className="flex flex-col gap-2">
        <Button onClick={() => {
            transition('CreateOrbit', { sphereEh: sphere.eH })
          }} className="btn mt-2 btn-secondary add-orbit border-0 w-full" size="sm">
          <PlusCircleOutlined className="icon" />
          <span>Create Orbit</span>
        </Button>
        <Button disabled={!sphereNodes || typeof sphereNodes == 'object' && !(Object.values(sphereNodes).length > 0)} className="btn responsive btn-primary w-full" size="sm" onClick={() => {
            store.set(currentSphere, {entryHash: sphere.eH, actionHash: sphere.id});
            store.set(currentOrbitCoords, {x: 0, y: 0});
              transition('Vis', {currentSphereEhB64: sphere.eH, currentSphereAhB64: sphere.id })
            }}>
          <TreeVisIcon />
          <span>Visualise</span>
        </Button>
      </div>}
    </div>
  );
};

export default SphereCard;
