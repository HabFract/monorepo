import React, { useEffect } from 'react';
import { useStateTransition } from '../hooks/useStateTransition';
import { GetOrbitsDocument, Orbit, Sphere, useGetSpheresQuery } from '../graphql/generated';
import { extractEdges, serializeAsyncActions } from '../graphql/utils';
import { sleep } from './lists/OrbitSubdivisionList';
import { mapToCacheObject, nodeCache, store } from '../state/jotaiKeyValueStore';
import { client } from '../graphql/client';
import { useSetAtom } from 'jotai';
import { currentSphere } from '../state/currentSphereHierarchyAtom';
import { Spinner } from 'flowbite-react';

type PreloadOrbitDataProps = {
};

const PreloadOrbitData : React.FC<PreloadOrbitDataProps> = ({}) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
 
  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  
  const clear = useSetAtom(nodeCache.clear)

  // Don't start at the home page for established users...
  const userHasSpheres = spheres?.spheres?.edges && spheres.spheres.edges.length > 0;
  !userHasSpheres && transition('CreateSphere');

  const sphereNodes = extractEdges(spheres!.spheres) as Sphere[];

  useEffect(() => {
    if(!sphereNodes) return;

    // Clean up the current cache first
    clear()

    // For now we will just use the first returned Sphere as the landing vis (this will always work for Onboarding)
    const { id: landingId, eH: landingEh } = sphereNodes[0];
    store.set(currentSphere, { actionHash: landingId, entryHash: landingEh });
    console.log('Current Sphere is now (eh, ah): :>> ', landingEh, landingId);
    try {
      serializeAsyncActions<any>(
        [...sphereNodes!.map(
          ({id, eH}) => 
            async () => {
              const variables = { sphereEntryHashB64: eH };
              let data;
              try {
                const gql = await client();
                data = await gql.query({ query: GetOrbitsDocument, variables, fetchPolicy: 'network-only'} )
                if(data?.data?.orbits) {
                  const orbits = (extractEdges(data.data.orbits) as Orbit[]);
                  const indexedOrbitData = Object.entries(orbits.map(mapToCacheObject))
                    .map(([_idx, value]) => [value.eH, value]);
                  store.set(nodeCache.set, id, Object.fromEntries(indexedOrbitData))
                  console.log('ALL Sphere orbits fetched and cached!')
                }
                await sleep(500);
              } catch(error) {
                console.error(error)
              }
          }),
          async() => Promise.resolve(console.log('Preloaded and cached! :>> ', store.get(nodeCache.items))),
          async() => transition('Vis', {currentSphereEhB64: landingEh, currentSphereAhB64: landingId }),
        ]
      ) 
    } catch (error) {
      console.error(error)
    }
  }, [sphereNodes])

  return <Spinner aria-label="Loading!"size="xl" className='full-spinner' />
};

export default PreloadOrbitData;
