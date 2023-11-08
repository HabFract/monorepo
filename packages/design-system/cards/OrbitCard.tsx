import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Import icons
import { Orbit } from '../../graphql/mocks/generated';

type OrbitCardProps = {
  orbit: Orbit;
};

const OrbitCard: React.FC<OrbitCardProps> = ({ orbit }) => {
  console.log('orbit :>> ', orbit);
  return (
    <div className="orbit-card flex flex-col rounded-lg">
      <header className="orbit-header flex bg-white rounded-t-lg">
        <div className="orbit-title flex-1">
          <h2>{orbit.name}</h2>
        </div>
        <div className="orbit-timeframe flex-1">
          <p>{orbit.metadata?.timeframeStart}</p>
        </div>
      </header>
      <div className="orbit-description flex items-center justify-center">
        <p>{orbit.metadata?.description}</p>
      </div>
      <div className="orbit-actions flex justify-center">
        <button className="flex-1">
          <EditOutlined />
          Edit
        </button>
        <button className="flex-1">
          <DeleteOutlined />
          Delete
        </button>
      </div>
      <div className="mini-vis flex items-center justify-center">
        Atomic? {orbit.metadata?.isAtomic && <p>{orbit.metadata.isAtomic}</p>}
      </div>
    </div>
  );
};

export default OrbitCard;
