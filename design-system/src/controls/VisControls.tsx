import React, { useRef, useEffect } from 'react';

interface VisControlsProps {
}

const VisControls: React.FC<VisControlsProps> = ({}) => {
  
  return (
    <div className="sphere-pie relative">
      <div className="pie" id="pie-chart"></div>
      <label><div className="sphere-pie-label absolute w-full top-1/2">Breakdown</div></label>
    </div>
  );
};

export default VisControls;
