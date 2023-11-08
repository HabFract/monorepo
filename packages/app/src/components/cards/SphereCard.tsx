import React from 'react';
import { Sphere } from '../types'; // Assuming you have a types file where Sphere type is defined

type SphereCardProps = {
  sphere: Sphere;
};

const SphereCard: React.FC<SphereCardProps> = ({ sphere }) => {
  return (
    <div className="sphere-card">
      <h3>{sphere.name}</h3>
      <p>{sphere.metadata?.description}</p>
      {sphere.metadata?.hashtag && <p>#{sphere.metadata.hashtag}</p>}
    </div>
  );
};

export default SphereCard;
