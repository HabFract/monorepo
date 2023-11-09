import React from 'react';
import './common.css';
import '../common.css';
import '../buttons/common.css';

import { Button } from 'flowbite-react';
import { EditOutlined, DeleteOutlined, PieChartOutlined } from '@ant-design/icons'; // Import icons
import { Orbit } from '../../app/src/graphql/mocks/generated';
import OrbitVis from '../vis/OrbitVis';

type OrbitCardProps = {
  orbit: Orbit;
};

const OrbitCard: React.FC<OrbitCardProps> = ({ orbit }: OrbitCardProps) => {
  // console.log('orbit :>> ', orbit);
  return (
    // @ts-ignore
    <div className="orbit-card flex flex-col rounded-2xl overflow-hidden">
      <header className="orbit-header flex bg-white rounded-t-lg items-center justify-around">
        <div className="orbit-title">
          <h2 className="card-name card-h1">{orbit.name}</h2>
        </div>
        <div className="orbit-timeframe col-c text-sm p-1">
          <span className="font-semibold">Last tracked:</span>
          <p>{new Date(orbit?.timeframe.startTime).toLocaleDateString('en-GB')}</p>
        </div>
      </header>
      <main className="card-body-bg p-4 gap-2 col-c">
        <div className="orbit-description flex items-center justify-center">
          <p className='card-copy'>{orbit.metadata?.description}</p>
        </div>
        <div className="row-c-around">
          <div className="orbit-actions col-c gap-2">
            <div className="orbit-actions-crud row-c-around">
              <Button className="btn btn-secondary" size="sm">
                <EditOutlined className="btn-icon" />
                Edit
              </Button>
              <Button className="btn btn-danger" size="sm">
                <DeleteOutlined className="btn-icon" />
                Delete
              </Button>
            </div>
            <div className="orbit-actions-vis row-c">
              <Button className="btn btn-primary" size="sm">
                <PieChartOutlined className="btn-icon" />
                Visualise
              </Button>
            </div>
          </div>
          <div className="mini-vis flex items-center justify-center">
            {orbit?.metadata?.scale && <OrbitVis scale={orbit.metadata.scale} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrbitCard;
