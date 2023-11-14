import { useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import GET_SPHERES from '../../graphql/queries/sphere/getSpheres.graphql';
import { SphereEdge } from '../../graphql/mocks/generated';

import './common.css';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';
import SphereCard from '../../../../design-system/cards/SphereCard';

function ListSpheres() {
  const { loading, error, data: { spheres } } = useQuery(GET_SPHERES);

  const [listSortFilter] = useAtom(listSortFilterAtom);

  const sortSpheres = (a, b) => {
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const sortedSpheres = spheres.edges.sort((edgeA, edgeB) => sortSpheres(edgeA.node, edgeB.node));

  return (
    <div className='h-full bg-dark-gray p-2 flex flex-col gap-2'>
      <PageHeader title="Spheres of Action" />
      <ListSortFilter />
      <div className="spheres-list">
        {sortedSpheres.map(({ node } : SphereEdge) => <SphereCard key={node.id} sphere={node} isHeader={false} />)}
      </div>
    </div>
  );
}

export default ListSpheres;
