import React from 'react';
import { PieChartOutlined, UnorderedListOutlined } from '@ant-design/icons'; // Import icons
import { Sphere } from '../types';
import SpherePie from './SpherePie'; // Import the new SpherePie component

type SphereCardProps = {
  sphere: Sphere;
};

const SphereCard: React.FC<SphereCardProps> = ({ sphere }) => {
  return (
    <div className="sphere-card">
      <header className="sphere-header">
        <h2 style={{ textAlign: 'center' }}>{sphere.name}</h2>
      </header>
      <div className="sphere-description">
        <p>{sphere.metadata?.description}</p>
        {sphere.metadata?.hashtag && <p>#{sphere.metadata.hashtag}</p>}
      </div>
      <div className="sphere-actions">
        <div className="actions-left" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button>
            <PieChartOutlined />
            Visualise
          </button>
          <button>
            <UnorderedListOutlined />
            Orbits
          </button>
        </div>
        <div className="actions-right" style={{ flex: 1 }}>
          <SpherePie />
        </div>
      </div>
    </div>
  );
};

export default SphereCard;
