import React, { useEffect } from 'react';
import { atom, getDefaultStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import miniDB, { store } from '../../state/jotaiKeyValueStore';
import './common.css';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';

import OrbitCard from '../../../../design-system/cards/OrbitCard';
import SphereCard from '../../../../design-system/cards/SphereCard';
import { Orbit, useDeleteOrbitMutation, useGetOrbitsLazyQuery, useGetSphereQuery } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { useStateTransition } from '../../hooks/useStateTransition';
import { OrbitNodeDetails, SphereNodeDetailsCache } from '../vis/BaseVis';
import { mapToCacheObject } from '../../state/jotaiKeyValueStore';
import { useFetchAndCacheSphereOrbits } from '../../hooks/useFetchAndCacheSphereOrbits';

interface ListOrbitsProps {
  sphereHash?: string; // Optional prop to filter orbits by sphere
}

const ListOrbits: React.FC<ListOrbitsProps> = ({ sphereHash }: ListOrbitsProps) => {
  const [_state, transition] = useStateTransition(); // Top level state machine and routing
  
  const [runDelete, { loading: loadingDelete, error: errorDelete, data: dataDelete }] = useDeleteOrbitMutation({
    refetchQueries: [
      'getOrbits',
    ],
  });

  const { loading, error, data } = useFetchAndCacheSphereOrbits({sphereAh: sphereHash});
  
  const [listSortFilter] = useAtom(listSortFilterAtom);
  const scaleValues = { Sub: 1, Atom: 2, Astro: 3 };
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  if(!data?.orbits) return <></>;
  
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
      {data?.sphere && <SphereCard sphere={data.sphere} isHeader={true} transition={transition} orbitScales={data.orbits.map((orbit: Orbit) => orbit?.scale)} />}
      <div className="orbits-list">
        {data.orbits.sort(sortOrbits)
          .map((orbit: Orbit) => <OrbitCard key={orbit.id} sphereEh={data.sphere.eH} transition={transition} orbit={orbit} runDelete={() => runDelete({variables: {id: orbit.id}})}/>)}
      </div>
    </div>
  );
}

export default ListOrbits;
