import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import './common.css';

import { useQuery, useLazyQuery } from '@apollo/client';
import { OrbitEdge, Sphere } from '../../graphql/mocks/generated';
import GET_SPHERE from '../../graphql/queries/sphere/getSphere.graphql';
// import GET_ORBITS from '../../graphql/queries/orbit/getOrbits.graphql';
import GET_ORBITS_BY_SPHERE from '../../graphql/queries/orbit/getOrbitsBySphere.graphql';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';

import OrbitCard from '../../../../design-system/cards/OrbitCard';
import SphereCard from '../../../../design-system/cards/SphereCard';

interface ListOrbitsProps {
  sphereId?: string; // Optional prop to filter orbits by sphere
}

function ListOrbits({ sphereId }: ListOrbitsProps) {
  const { loading: loadingOrbits, error: errorOrbits, data: dataOrbits } = useQuery(GET_ORBITS_BY_SPHERE, {
    variables: { sphereEntryHashB64: sphereId },
    skip: !sphereId, // Skip the query if no sphereId is provided
  });

  const [getSphere, { loading: loadingSphere, data: dataSphere }] = useLazyQuery(GET_SPHERE, {
    variables: { id: sphereId },
  });

  // Fetch sphere details when component mounts if sphereId is provided
  useEffect(() => {
    if (sphereId) {
      getSphere();
    }
    console.log('dataSphere :>> ', sphereId == 'SGVhbHRoMQ==', loadingSphere, dataSphere);
  }, [sphereId, getSphere]);

  const [listSortFilter] = useAtom(listSortFilterAtom);

  const sortOrbits = (a, b) => {
    // Implement your sorting logic here based on listSortFilter.sortCriteria and listSortFilter.sortOrder
    // This is a placeholder, replace with actual properties and comparison
    const propertyA = a[listSortFilter.sortCriteria];
    const propertyB = b[listSortFilter.sortCriteria];
    if (listSortFilter.sortOrder === 'ASCENDING') {
      return propertyA.localeCompare(propertyB);
    } else {
      return propertyB.localeCompare(propertyA);
    }
  };

  if (loadingOrbits || loadingSphere) return <p>Loading...</p>;
  if (errorOrbits) return <p>Error : {errorOrbits.message}</p>;

  const sortedOrbits = dataOrbits.orbits.edges.sort((edgeA, edgeB) => sortOrbits(edgeA.node, edgeB.node));

  return (
    <div className='h-full bg-dark-gray p-2 flex flex-col gap-2'>
      <PageHeader title="List Orbits" />
      <ListSortFilter label={'for the Sphere'} />
      {dataSphere && <SphereCard sphere={dataSphere.sphere} isHeader={true} />// change this to dataSphere in real query
      }
      <div className="orbits-list">
        {sortedOrbits.map(({ node } : OrbitEdge) => <OrbitCard key={node.id} orbit={node} />)}
      </div>
    </div>
  );
}

export default ListOrbits;
