import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import './common.css';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';

import OrbitCard from '../../../../design-system/cards/OrbitCard';
import SphereCard from '../../../../design-system/cards/SphereCard';
import { Orbit, useGetOrbitsLazyQuery, useGetOrbitsQuery, useGetSphereLazyQuery, useGetSphereQuery } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { useStateTransition } from '../../hooks/useStateTransition';

interface ListOrbitsProps {
  sphereHash?: string; // Optional prop to filter orbits by sphere
}

const ListOrbits: React.FC = ({ sphereHash }: ListOrbitsProps) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  
  debugger;
  const { loading: loadingSphere, data: dataSphere } = useGetSphereQuery({
    variables: { id: sphereHash as string },
    skip: !sphereHash
  });
  
  const sphereEh = dataSphere?.sphere?.eH;
  const [getOrbits, { loading: loadingOrbits, error: errorOrbits, data }] = useGetOrbitsLazyQuery({
    fetchPolicy: 'cache-first',
    variables: { sphereEntryHashB64: sphereEh },
  });
  
  useEffect(() => {
    if (sphereEh) {
      getOrbits();
    }
  }, [dataSphere, loadingSphere]);

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
      <PageHeader title="Orbit List" />
      <ListSortFilter label={'for the Sphere:'} />
      {dataSphere && <SphereCard sphere={dataSphere.sphere} isHeader={true} transition={transition} orbitScales={orbits.map((orbit: Orbit) => orbit?.scale)} />}
      <div className="orbits-list">
        {orbits.sort(sortOrbits)
          .map((orbit: Orbit) => <OrbitCard key={orbit.id} sphereEh={sphereEh} transition={transition} orbit={orbit} />)}
      </div>
    </div>
  );
}

export default ListOrbits;
