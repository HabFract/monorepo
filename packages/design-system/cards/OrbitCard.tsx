import React from 'react';
import './common.css';
import '../common.css';
import '../buttons/common.css';

import { Button } from 'flowbite-react';
import { EditOutlined, DeleteOutlined, PieChartOutlined } from '@ant-design/icons'; // Import icons
import { Orbit } from '../../app/src/graphql/generated';
import OrbitVis from '../vis/OrbitVis';

type OrbitCardProps = {
  orbit: Orbit;
};

const OrbitCard: React.FC<OrbitCardProps> = ({ orbit }: OrbitCardProps) => {
  return (
    <div className="orbit-card flex flex-col rounded-2xl overflow-hidden">
      <header className="orbit-header card-header">
        <div className="orbit-title">
          <h2 className="card-name card-h1">{orbit.name}</h2>
        </div>
        <div className="orbit-timeframe col-c text-sm p-1">
          <span className="font-semibold">Last tracked:</span>
          <p>{new Date(orbit?.timeframe.startTime).toLocaleDateString('en-GB')}</p>
        </div>
      </header>
      <main className="card-body-bg col-c">
        <div className="orbit-description flex items-center justify-center">
          <p className='card-copy'>{orbit.metadata?.description}</p>
        </div>
        <div className="row-c-around h-full">
          <div className="orbit-actions col-c gap-2">
            <div className="orbit-actions-crud row-c-around">
              <Button className="btn responsive btn-warn" size="sm">
                <EditOutlined className="btn-icon" />
                <span>Edit</span>
              </Button>
              <Button className="btn responsive btn-danger" size="sm">
                <DeleteOutlined className="btn-icon" />
                <span>Delete</span>
              </Button>
            </div>
            <div className="orbit-actions-vis row-c">
              <Button className="btn btn-primary" size="sm">
                <PieChartOutlined className="btn-icon" />
                <span>Visualise</span>
              </Button>
            </div>
          </div>
          <div className="mini-vis col-c">
            {orbit?.metadata?.scale && <OrbitVis scale={orbit.metadata.scale} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrbitCard;
