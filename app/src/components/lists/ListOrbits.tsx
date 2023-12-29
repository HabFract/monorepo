import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import './common.css';

import { useQuery, useLazyQuery } from '@apollo/client';
import GET_SPHERE from '../../graphql/queries/sphere/getSphere.graphql';
// import GET_ORBITS from '../../graphql/queries/orbit/getOrbits.graphql';
import GET_ORBITS_BY_SPHERE from '../../graphql/queries/orbit/getOrbitsBySphere.graphql';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';

import OrbitCard from '../../../../design-system/cards/OrbitCard';
import SphereCard from '../../../../design-system/cards/SphereCard';
import { Orbit, OrbitMetaData, OrbitEdge } from '../../graphql/generated';

interface ListOrbitsProps {
  sphereId?: string; // Optional prop to filter orbits by sphere
}

const ListOrbits: React.FC = ({ sphereId }: ListOrbitsProps) => {
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
  }, [sphereId, getSphere]);

  const [listSortFilter] = useAtom(listSortFilterAtom);

  const scaleValues = { Sub: 1, Atom: 2, Astro: 3 };

  const sortOrbits = (a: Orbit, b: Orbit) => {
    let propertyA;
    let propertyB;

    // If the sortCriteria is 'scale', use the scaleValues for comparison
    if (listSortFilter.sortCriteria === 'name') {
      propertyA = a ? a[listSortFilter.sortCriteria as keyof Orbit] : 0
      propertyB = b ? b[listSortFilter.sortCriteria as keyof Orbit] : 0
    } else {
      propertyA = a?.metadata![listSortFilter.sortCriteria as keyof OrbitMetaData];
      propertyB = b?.metadata![listSortFilter.sortCriteria as keyof OrbitMetaData];
      propertyA = scaleValues[propertyA] || 0; // Assign a default value if propertyA is undefined
      propertyB = scaleValues[propertyB] || 0; // Assign a default value if propertyB is undefined
    }


    if (listSortFilter.sortOrder === 'lowestToGreatest') {
      return propertyA < propertyB ? -1 : propertyA > propertyB ? 1 : 0;
    } else {
      return propertyA > propertyB ? -1 : propertyA < propertyB ? 1 : 0;
    }
  };

  if (loadingOrbits || loadingSphere) return <p>Loading...</p>;
  if (errorOrbits) return <p>Error : {errorOrbits.message}</p>;
  return (
    <div className='layout orbits'>
      <PageHeader title="Orbit List" />
      <ListSortFilter label={'for the Sphere'} />
      {dataSphere && <SphereCard sphere={dataSphere.sphere} isHeader={true} orbitScales={dataOrbits.orbits.edges.map((orbitEdge: OrbitEdge) => orbitEdge.node.metadata?.scale )} />// change this to dataSphere in real query
      }
      <div className="orbits-list">
        {[...dataOrbits.orbits.edges].sort((edgeA: OrbitEdge, edgeB: OrbitEdge) => sortOrbits(edgeA.node, edgeB.node))
          .map(({ node }: OrbitEdge) => <OrbitCard key={node.id} orbit={node} />)}
      </div>
    </div>
  );
}

export default ListOrbits;
