import React from 'react';
import './common.css';
import '../common.css';
import '../buttons/common.css';

import { Button, Dropdown } from 'flowbite-react';
import { EditOutlined, DeleteOutlined, PieChartOutlined } from '@ant-design/icons'; // Import icons
import { Orbit } from '../../app/src/graphql/generated';
import OrbitVis from '../vis/OrbitVis';
import { currentOrbitCoords } from '../../app/src/state/currentSphereHierarchyAtom';
import { store } from '../../app/src/state/jotaiKeyValueStore';

type OrbitCardProps = {
  orbit: Orbit;
  sphereEh?: string,
  transition: (newState: string, params?: object) => void
  runDelete: () => void
};

const OrbitCard: React.FC<OrbitCardProps> = ({ orbit, sphereEh, transition, runDelete }: OrbitCardProps) => {
  return (
    <div className="orbit-card flex flex-col rounded-2xl overflow-hidden">
      <header className="orbit-header card-header">
        <div className="orbit-title">
          <h2 className="card-name card-h1">{orbit.name}</h2>
        </div>
        <div className="orbit-timeframe col-c text-sm">
          <span className="font-semibold">Last tracked:</span>
          <p>{new Date(orbit?.metadata!.timeframe?.startTime)?.toLocaleDateString('en-us')}</p>
        </div>
      </header>
      <main className="card-body-bg col-c">
        <div className="orbit-description flex items-center justify-center">
          {orbit?.metadata?.description && orbit?.metadata?.description !== '' && <p className='card-copy'>{orbit.metadata?.description}</p>}        </div>
        <div className="row-c-around h-full big-gap">
          <div className="orbit-actions col-c gap-2">
            <div className="orbit-actions-crud flex-col row-c-around">
            <Dropdown label="Manage" dismissOnClick={false} className="bg-red-500 hover:bg-red-600">
              <Dropdown.Item onClick={() => {transition('CreateOrbit', { editMode: true, orbitToEditId: orbit.id, sphereEh })}}>
                <span>
                  <EditOutlined className="icon" />
                  Edit
                </span>
              </Dropdown.Item>
              <Dropdown.Item>
                <span>
                  <DeleteOutlined className="icon" />
                  Delete
                </span>
              </Dropdown.Item>
            </Dropdown>
            </div>
            <div className="orbit-actions-vis row-c">
              {/* <Button className="btn btn-primary" size="sm" onClick={() => {
        store.set(currentOrbitCoords, {x: 0, y: 0}); transition('Vis', { orbitEh: orbit.eH })}}>
                <PieChartOutlined className="btn-icon" />
                <span>Visualise</span>
              </Button> */}
            </div>
          </div>
          <div className="mini-vis col-c">
            {orbit?.scale && <OrbitVis scale={orbit.scale} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrbitCard;
