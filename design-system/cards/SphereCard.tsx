import React from 'react';
import './common.css';
import { DeleteOutlined, EditOutlined, PieChartOutlined, OrderedListOutlined, PlusCircleFilled, PlusCircleOutlined } from '@ant-design/icons';
import SphereVis from '../vis/SphereVis';
import { Scale, Sphere } from '../../app/src/graphql/generated';
import { Button } from 'flowbite-react';

type SphereCardProps = {
  sphere: Sphere;
  isHeader: boolean;
  orbitScales: Scale[];
  transition: (newState: string, params?: object) => void;
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

const SphereCard: React.FC<SphereCardProps> = ({ sphere, isHeader, orbitScales, transition } : SphereCardProps) => {
  const { name, metadata } = sphere;
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
          <p className='card-copy'>{metadata?.description}</p>
        </div>
        <div className="row-c-around h-full flex-1">
          <div className="sphere-actions col-c">
            <div className="sphere-actions-crud col-c w-full">
              <Button className="btn responsive btn-warn w-full" size="sm">
                <EditOutlined className="btn-icon" />
                <span>Edit</span>
              </Button>
              <Button className="btn responsive btn-danger w-full" size="sm">
                <DeleteOutlined className="btn-icon" />
                <span>Delete</span>
              </Button>
            </div>
            <div className="sphere-actions-vis col-c">
              {!isHeader && <Button onClick={() => transition('ListOrbits', { sphereHash: sphere.id })} className="btn mt-2 responsive btn-neutral w-full" size="sm">
                <OrderedListOutlined className="btn-icon" />
                <span>Orbits</span>
              </Button>}

              {!isHeader && <Button onClick={() => transition('CreateOrbit', { sphereEh: sphere.eH })} className="btn responsive btn-primary border-0 w-full" size="sm">
                <PlusCircleOutlined className="btn-icon btn-primary" />
                <span>Add Orbit</span>
              </Button>}

              <Button className="btn responsive btn-primary w-full" size="sm">
                <PieChartOutlined className="btn-icon" />
                <span>Visualise</span>
              </Button>
            </div>
          </div>
          <div className="mini-vis col-c flex-1">
            <SphereVis spherePercentages={calculateSpherePercentages(calculateSphereCounts(orbitScales))}/>
          </div>
        </div>
      </main>
      {isHeader && <Button onClick={() => transition('CreateOrbit', { sphereEh: sphere.eH })} className="btn mt-2 btn-secondary border-0 w-full" size="sm">
        <PlusCircleOutlined className="btn-icon btn-secondary" />
        <span>Add Orbit</span>
      </Button>}
    </div>
  );
};

export default SphereCard;
