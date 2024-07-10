import React, { useEffect } from 'react';
import './style.css';
import { useStateTransition } from '../hooks/useStateTransition';
import { Sphere, useGetSpheresQuery } from '../graphql/generated';
import { extractEdges, serializeAsyncActions } from '../graphql/utils';
import { ActionHashB64 } from '@holochain/client';
import { sleep } from './lists/OrbitSubdivisionList';
import { useFetchAndCacheSphereOrbits } from '../hooks/useFetchAndCacheSphereOrbits';

type PreloadOrbitDataProps = {
};

const PreloadOrbitData : React.FC<PreloadOrbitDataProps> = ({}) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
 
  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  
  // Don't start at the home page for established users...
  const userHasSpheres = spheres?.spheres?.edges && spheres.spheres.edges.length > 0;
  !userHasSpheres && transition('CreateSphere');

  const mappedSphereIds = extractEdges(spheres!.spheres)?.map(sphere => sphere.id) as ActionHashB64[];

  useEffect(() => {
    if(!mappedSphereIds) return;
    try {
      serializeAsyncActions<any>(
        mappedSphereIds!.map(
          (sphereId) => {
            return async () => {
              await sleep(2500);
              return useFetchAndCacheSphereOrbits({sphereAh: sphereId}) }
          })
        )
        console.log('cached! :>> ');
    } catch (error) {
      console.error(error)
    }
      
    
  }, [mappedSphereIds])
  return (<div role="heading" className="page-header">
    Cacheing!
  </div>)
};

export default PreloadOrbitData;
