import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import './common.css';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';

import OrbitCard from '../../../../design-system/cards/OrbitCard';
import SphereCard from '../../../../design-system/cards/SphereCard';
import { Orbit, useGetOrbitsQuery, useGetSphereLazyQuery } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';

interface ListOrbitsProps {
  sphereEh?: string; // Optional prop to filter orbits by sphere
}

const ListOrbits: React.FC = ({ sphereEh }: ListOrbitsProps) => {
  const [getSphere, { loading: loadingSphere, data: dataSphere }] = useGetSphereLazyQuery({
    variables: { id: sphereEh as string },
  });

  const { loading: loadingOrbits, error: errorOrbits, data } = useGetOrbitsQuery({
    variables: { sphereEntryHashB64: sphereEh },
    skip: !sphereEh, // Skip the query if no sphereEh is provided
  });

  // Fetch sphere details when component mounts if sphereEh is provided
  useEffect(() => {
    if (sphereEh) {
      getSphere();
    }
  }, [sphereEh]);

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
      propertyA = a?.metadata![listSortFilter.sortCriteria as any];
      propertyB = b?.metadata![listSortFilter.sortCriteria as any];
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
      <ListSortFilter label={'for the Sphere'} />
      {dataSphere && <SphereCard sphere={dataSphere.sphere} isHeader={true} orbitScales={orbits.map((orbit: Orbit) => orbit?.scale )} />}
      <div className="orbits-list">
        {orbits.sort(sortOrbits)
          .map((orbit: Orbit) => <OrbitCard key={orbit.id} orbit={orbit} />)}
      </div>
    </div>
  );
}

export default ListOrbits;
