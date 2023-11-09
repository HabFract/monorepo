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
  console.log('sphere :>> ', sphere);
  return (
    // @ts-ignore
    <div className="orbit-card flex flex-col rounded-2xl overflow-hidden">
      <header className="orbit-header flex bg-off-white rounded-t-lg items-center justify-around">
        <div className="orbit-title">
          <h2 className="card-name card-h1"></h2>
        </div>
        <div className="orbit-timeframe col-c text-sm p-1">
          <span className="font-semibold">Last tracked:</span>
          <p>{}</p>
        </div>
      </header>
      <main className="card-body-bg p-4 gap-2 col-c">
        <div className="orbit-description flex items-center justify-center">
          <p className='card-copy'>{}</p>
        </div>
        <div className="row-c-around">
          <div className="orbit-actions col-c gap-2">
            <div className="orbit-actions-crud row-c-around">
              <Button className="btn responsive btn-secondary" size="sm">
                <EditOutlined className="btn-icon" />
                <span>Edit</span>
              </Button>
              <Button className="btn responsive btn-danger" size="sm">
                <DeleteOutlined className="btn-icon" />
                <span>Delete</span>
              </Button>
            </div>
            <div className="orbit-actions-vis col-c">
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
          <div className="mini-vis col-c">
            <SphereVis />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SphereCard;
