import React from 'react';
import './common.css';
import '../common.css';
import '../buttons/common.css';

import { Button, Dropdown } from 'flowbite-react';
import { EditOutlined, DeleteOutlined, PieChartOutlined } from '@ant-design/icons'; // Import icons
import { Orbit } from '../../../ui/src/graphql/generated';
import { OrbitVis } from '../vis';

export type OrbitCardProps = {
  orbit: Orbit;
  sphereEh?: string,
  transition?: (newState: string, params?: object) => void,
  runDelete?: () => void,
  displayOnly?: boolean
};

const OrbitCard: React.FC<OrbitCardProps> = ({ orbit, sphereEh, transition, runDelete, displayOnly = false }: OrbitCardProps) => {
  return (
    <div className={ displayOnly ? "orbit-card display-only" : "orbit-card"}>
      <header className="orbit-header card-header">
        <div className="orbit-title">
          <h2 className="card-name card-h1">{orbit.name}</h2>
        </div>
        <div className="orbit-timeframe col-c text-sm">
          <span className="font-semibold">Last tracked:</span>
          <p>{new Date(orbit?.metadata!.timeframe?.startTime)?.toLocaleDateString('en-us')}</p>
        </div>
      </header>
      <section className="card-body-bg col-c">
        <div className="orbit-description flex items-center justify-center">
          {orbit?.metadata?.description && orbit?.metadata?.description !== '' && <p className='card-copy'>{orbit.metadata?.description}</p>}        </div>
        <div className="row-c-around h-full big-gap-sm">
          {!displayOnly && <div className="orbit-actions col-c gap-2">
            <div className="orbit-actions-crud flex-col row-c-around">
              <Dropdown label="Manage" dismissOnClick={false} className="bg-secondary p-2">
                <Dropdown.Item onClick={() => {transition?.('CreateOrbit', { editMode: true, orbitToEditId: orbit.id, sphereEh })}}>
                  <span>
                    <EditOutlined className="icon" />
                    Edit
                  </span>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => {runDelete?.()}}>
                  <span>
                    <DeleteOutlined className="icon" />
                    Delete
                  </span>
                </Dropdown.Item>
              </Dropdown>
            </div>
            <div className="orbit-actions-vis row-c">
            </div>
          </div>}
          <div className="mini-vis col-c">
            {orbit?.scale && <OrbitVis scale={orbit.scale} />}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrbitCard;
