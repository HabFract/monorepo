import React from 'react';
import './style.css';
import { useStateTransition } from '../hooks/useStateTransition';
import { useGetSpheresQuery } from '../graphql/generated';

type PreloadOrbitDataProps = {
};

const PreloadOrbitData : React.FC<PreloadOrbitDataProps> = ({}) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
 
  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  
  // Don't start at the home page for established users...
  const userHasSpheres = spheres?.spheres?.edges && spheres.spheres.edges.length > 0;
  !userHasSpheres && transition('CreateSphere');
  
  return (<div role="heading" className="page-header">
    Cacheing!
  </div>)
};

export default PreloadOrbitData;
