import React from 'react';
import { PieChartOutlined, UnorderedListOutlined } from '@ant-design/icons'; // Import icons
import { Orbit } from '../../graphql/mocks/generated';

type OrbitCardProps = {
  orbit: Orbit;
};

const OrbitCard: React.FC<OrbitCardProps> = ({ orbit }) => {
  console.log('orbit :>> ', orbit);
  return (
    <div className="orbit-card flex flex-col">
      <header className="orbit-header">
        <h2 style={{ textAlign: 'center' }}>{orbit.name}</h2>
      </header>
      <div className="orbit-description">
        <p>{orbit.metadata?.description}</p>
      </div>
      <div className="orbit-actions flex">
        <div className="actions" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button>
            <PieChartOutlined />
            Visualise
          </button>
          <button>
            <UnorderedListOutlined />
            Orbits
          </button>
        </div>
        <div className="mini-vis" style={{ flex: 1 }}>
          Atomic? {orbit.metadata?.isAtomic && <p>{orbit.metadata.isAtomic}</p>}
        </div>
      </div>
    </div>
  );
};

export default OrbitCard;
