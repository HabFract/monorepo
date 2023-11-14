import { useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import GET_SPHERES from '../../graphql/queries/sphere/getSpheres.graphql';
import { Scale, Sphere, SphereEdge, SphereMetaData } from '../../graphql/mocks/generated';

import './common.css';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';
import SphereCard from '../../../../design-system/cards/SphereCard';

function ListSpheres() {
  const { loading, error, data: { spheres } } = useQuery(GET_SPHERES);

  const [listSortFilter] = useAtom(listSortFilterAtom);

  const sortSpheres = (a: Sphere, b: Sphere) => {
    let propertyA;
    let propertyB;

    // If the sortCriteria is 'scale', use the scaleValues for comparison
    if (listSortFilter.sortCriteria === 'name') {
      propertyA = a ? a[listSortFilter.sortCriteria as keyof Sphere] : 0
      propertyB = b ? b[listSortFilter.sortCriteria as keyof Sphere] : 0
    } else {
      propertyA = a?.metadata[listSortFilter.sortCriteria as keyof SphereMetaData];
      propertyB = b?.metadata[listSortFilter.sortCriteria as keyof SphereMetaData];
    }


    if (listSortFilter.sortOrder === 'lowestToGreatest') {
      return propertyA < propertyB ? -1 : propertyA > propertyB ? 1 : 0;
    } else {
      return propertyA > propertyB ? -1 : propertyA < propertyB ? 1 : 0;
    }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const sortedSpheres = [...spheres.edges].sort((edgeA: SphereEdge, edgeB: SphereEdge) => sortSpheres(edgeA.node, edgeB.node));

  return (
    <div className='h-full bg-dark-gray p-2 flex flex-col gap-2'>
      <PageHeader title="Spheres of Action" />
      <ListSortFilter label='' />
      <div className="spheres-list">
        {sortedSpheres.map(({ node } : SphereEdge) => <SphereCard key={node.id} sphere={node} isHeader={false} orbitScales={[Scale.ASTRO]}/>)}
      </div>
    </div>
  );
}

export default ListSpheres;
