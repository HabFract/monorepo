import React from 'react';
import './common.css';
import { DeleteOutlined, EditOutlined, PieChartOutlined, OrderedListOutlined } from '@ant-design/icons';
import SphereVis from '../vis/SphereVis';
import { Sphere } from '../../app/src/graphql/mocks/generated';
import { Button } from 'flowbite-react';

type SphereCardProps = {
  sphere: Sphere;
};

const SphereCard: React.FC<SphereCardProps> = ({ sphere } : SphereCardProps) => {
  const { name, metadata } = sphere;
  return (
    <div className="sphere-card flex flex-col rounded-2xl overflow-hidden">
      <header className="sphere-header card-header">
        <div className="sphere-title">
          <h2 className="card-name card-h1">{name}</h2>
        </div>
        {/* <div className="sphere-timeframe col-c text-sm p-1">
          <span className="font-semibold">Last tracked:</span>
          <p>{}</p>
        </div> */}
      </header>
      <main className="card-body-bg p-4 gap-2 col-c">
        <div className="sphere-description flex items-center justify-center">
          <p className='card-copy'>{metadata?.description}</p>
        </div>
        <div className="row-c-around flex-1">
          <div className="sphere-actions col-c gap-2">
            <div className="sphere-actions-crud col-c">
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
              <Button className="btn btn-primary w-full" size="sm">
                <PieChartOutlined className="btn-icon" />
                <span>Visualise</span>
              </Button>
              <Button className="btn btn-neutral w-full" size="sm">
                <OrderedListOutlined className="btn-icon" />
                <span>Orbits</span>
              </Button>
            </div>
          </div>
          <div className="mini-vis col-c flex-1">
            <SphereVis />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SphereCard;
