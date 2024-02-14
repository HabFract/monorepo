import React, { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import nodeStore from '../../state/jotaiKeyValueStore';
import './common.css';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';

import OrbitCard from '../../../../design-system/cards/OrbitCard';
import SphereCard from '../../../../design-system/cards/SphereCard';
import { Orbit, OrbitEdge, useDeleteOrbitMutation, useGetOrbitsLazyQuery, useGetOrbitsQuery, useGetSphereLazyQuery, useGetSphereQuery } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { useStateTransition } from '../../hooks/useStateTransition';
import { OrbitNodeDetails, SphereNodeDetailsCache, SphereOrbitNodes } from '../vis/BaseVis';
import { currentSphere } from '../../state/currentSphereHierarchyAtom';

interface ListOrbitsProps {
  sphereHash?: string; // Optional prop to filter orbits by sphere
}

const ListOrbits: React.FC<ListOrbitsProps> = ({ sphereHash }: ListOrbitsProps) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  
  const db = useAtomValue(nodeStore.keys);
  const setMany = useSetAtom(nodeStore.setMany)
  const mapToCacheObject = (orbit: Orbit) => ({
    id: orbit.id,
    name: orbit.name,
    scale: orbit.scale,
    description: orbit.metadata?.description,
    startTime: orbit.metadata?.timeframe.startTime,
    endTime: orbit.metadata?.timeframe.endTime,
  })
  
  const { loading: loadingSphere, data: dataSphere } = useGetSphereQuery({
    variables: { id: sphereHash as string },
    skip: !sphereHash
  });
  const sphereEh = dataSphere?.sphere?.eH;

  const [runDelete, { loading: loadingDelete, error: errorDelete, data: dataDelete }] = useDeleteOrbitMutation({
    refetchQueries: [
      'getOrbits',
    ],
  });
  
  const [getOrbits, { loading: loadingOrbits, error: errorOrbits, data }] = useGetOrbitsLazyQuery({
    fetchPolicy: 'network-only',
    variables: { sphereEntryHashB64: sphereEh },
  });
  
  const [selectedSphere] = useAtom(currentSphere);
  
  useEffect(() => {
    if (sphereEh && dataSphere) {
      getOrbits();
    }
  }, [dataSphere, loadingSphere]);

  useEffect(() => {
    if (data) {
      // Cache the necessary details to be available for the BaseVisualization
      let orbits: Orbit[] = extractEdges(data.orbits);
      let indexedOrbitData = Object.entries(orbits.map(mapToCacheObject))
      .map(([_idx, value]) => {
        return [value.id, value]
      })
      let indexedSphereData : SphereNodeDetailsCache = {};
      const entries = indexedOrbitData.reduce((cacheObject, [id, entry], idx) => {
        if(idx == 0) {
          cacheObject[selectedSphere.actionHash as keyof SphereNodeDetailsCache] = { [id as string]: entry as OrbitNodeDetails }        
        }
        cacheObject[selectedSphere.actionHash as keyof SphereNodeDetailsCache][id as string] = entry as OrbitNodeDetails;
        return cacheObject
      }, indexedSphereData)

        // NOTE: this is provisionally using the structure { {SPHERE_AH} : { {ORBIT_AH} : {DETAILS} } }
        // and may need to be adapted once WIN records are also cached.
      setMany(Object.entries(entries));
      console.log('db :>> ', db);
    }
  }, [data]);
  
  const [listSortFilter] = useAtom(listSortFilterAtom);
  const scaleValues = { Sub: 1, Atom: 2, Astro: 3 };
  
  if (loadingOrbits || loadingSphere) return <p>Loading...</p>;
  if (errorOrbits) return <p>Error : {errorOrbits.message}</p>;
  if(!data?.orbits) return <></>;
  
  const orbits = extractEdges(data.orbits);
  
  const sortOrbits = (a: Orbit, b: Orbit) => {
    let propertyA;
    let propertyB;

    // If the sortCriteria is 'scale', use the scaleValues for comparison
    if (listSortFilter.sortCriteria === 'name') {
      propertyA = a ? a[listSortFilter.sortCriteria as keyof Orbit] : 0
      propertyB = b ? b[listSortFilter.sortCriteria as keyof Orbit] : 0
    } else {
      propertyA = a![listSortFilter.sortCriteria as any];
      propertyB = b![listSortFilter.sortCriteria as any];
      propertyA = scaleValues[propertyA] || 0; // Assign a default value if propertyA is undefined
      propertyB = scaleValues[propertyB] || 0; // Assign a default value if propertyB is undefined
    }

    if (listSortFilter.sortOrder === 'lowestToGreatest') {
      return propertyA < propertyB ? -1 : propertyA > propertyB ? 1 : 0;
    } else {
      return propertyA > propertyB ? -1 : propertyA < propertyB ? 1 : 0;
    }
  };

  return (
    <div className='layout orbits'>
      <PageHeader title="Orbits Breakdown " />
      <ListSortFilter label={'for the Sphere:'} />
      {dataSphere && <SphereCard sphere={dataSphere.sphere} isHeader={true} transition={transition} orbitScales={orbits.map((orbit: Orbit) => orbit?.scale)} />}
      <div className="orbits-list">
        {orbits.sort(sortOrbits)
          .map((orbit: Orbit) => <OrbitCard key={orbit.id} sphereEh={sphereEh} transition={transition} orbit={orbit} runDelete={() => runDelete({variables: {id: orbit.id}})}/>)}
      </div>
    </div>
  );
}

export default ListOrbits;
