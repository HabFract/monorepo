import React from 'react';
import './common.css';
import { DeleteOutlined, EditOutlined, PieChartOutlined, OrderedListOutlined, PlusCircleFilled, PlusCircleOutlined } from '@ant-design/icons';
import { SphereVis } from '../vis';
import { Scale, Sphere } from '../../../app/src/graphql/generated';
import { Button } from 'flowbite-react';
import { currentOrbitCoords, currentSphere } from '../../../app/src/state/currentSphereHierarchyAtom';
import { SphereNodeDetailsCache, SphereOrbitNodes, nodeCache, store } from '../../../app/src/state/jotaiKeyValueStore';
import TreeVisIcon from '../../../app/src/components/TreeVisIcon';

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
      <main className="card-body-bg sphere-card col-c">
        <div className="sphere-description flex items-center justify-center">
          {metadata?.description && metadata?.description !== '' && <p className='card-copy'>{metadata.description}</p>}
        </div>
        <div className="card-actions">
          <div className="sphere-actions-vis col-c w-full">
            {!isHeader && <Button onClick={() => transition('ListOrbits', { sphereAh: sphere.id })} className="btn mt-2 responsive btn-neutral w-full" size="sm">
              <OrderedListOutlined className="icon" />
              <span>Orbits</span>
            </Button>}

            {!isHeader && <Button onClick={() => transition('CreateOrbit', { sphereEh: sphere.eH })} className="btn responsive btn-secondary add-orbit border-0 w-full" size="sm">
              <PlusCircleOutlined className="icon" />
              <span>Create Orbit</span>
            </Button>}

            <Button disabled={!sphereNodes || typeof sphereNodes == 'object' && !(Object.values(sphereNodes).length > 0)} className="btn responsive btn-primary w-full" size="sm" onClick={() => {
                store.set(currentSphere, {entryHash: sphere.eH, actionHash: sphere.id});
                store.set(currentOrbitCoords, {x: 0, y: 0}); transition('Vis', {currentSphereEhB64: sphere.eH, currentSphereAhB64: sphere.id })}}>
              <TreeVisIcon />
              <span>Visualise</span>
            </Button>
          </div>
        </div>
        { isHeader && <div className="mini-vis col-c flex-1">
          <SphereVis spherePercentages={calculateSpherePercentages(calculateSphereCounts(orbitScales))}/>
        </div>}
      </main>
      {isHeader && <Button onClick={() => transition('CreateOrbit', { sphereEh: sphere.eH })} className="btn mt-2 btn-primary add-orbit border-0 w-full" size="sm">
        <PlusCircleOutlined className="icon" />
        <span>Add Orbit</span>
      </Button>}
    </div>
  );
};

export default SphereCard;
