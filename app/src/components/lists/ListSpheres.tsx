import { useAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import { Scale, Sphere, useGetSpheresQuery } from '../../graphql/generated';

import './common.css';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';
import SphereCard from '../../../../design-system/cards/SphereCard';
import { extractEdges } from '../../graphql/utils';
import { useStateTransition } from '../../hooks/useStateTransition';

function ListSpheres() {
  const { loading, error, data } = useGetSpheresQuery();

  const [listSortFilter] = useAtom(listSortFilterAtom);

  const sortSpheres = (a: Sphere, b: Sphere) => {
    let propertyA;
    let propertyB;

    // If the sortCriteria is 'scale', use the scaleValues for comparison
    if (listSortFilter.sortCriteria === 'name') {
      propertyA = a ? a[listSortFilter.sortCriteria as keyof Sphere] : 0
      propertyB = b ? b[listSortFilter.sortCriteria as keyof Sphere] : 0
    } else {
      propertyA = a?.metadata![listSortFilter.sortCriteria as any];
      propertyB = b?.metadata![listSortFilter.sortCriteria as any];
    }


    if (listSortFilter.sortOrder === 'lowestToGreatest') {
      return propertyA < propertyB ? -1 : propertyA > propertyB ? 1 : 0;
    } else {
      return propertyA > propertyB ? -1 : propertyA < propertyB ? 1 : 0;
    }
  };

  const [state, transition] = useStateTransition(); // Top level state machine and routing

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const spheres = extractEdges(data!.spheres) as Sphere[];
  const sortedSpheres = spheres.sort((s1: Sphere, s2: Sphere) => sortSpheres(s1, s2));
  
  return (
    <div className='layout spheres'>
      <PageHeader title="Spheres of Action" />
      <ListSortFilter label='' />
      <div className="spheres-list">
        {sortedSpheres.map((sphere : Sphere) => <SphereCard key={sphere.id} sphere={sphere} transition={transition} isHeader={false} orbitScales={[Scale.Astro]}/>)}
      </div>
    </div>
  );
}

export default ListSpheres;
