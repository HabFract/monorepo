import { useQuery } from '@apollo/client';
import GET_SPHERES from '../../graphql/queries/sphere/getSpheres.graphql';
import { SphereEdge } from '../../graphql/mocks/generated';

import './common.css';

import PageHeader from '../PageHeader';
import ListSortFilter from './ListSortFilter';
import SphereCard from '../../../../design-system/cards/SphereCard';

function ListSpheres() {
  const { loading, error, data: { spheres } } = useQuery(GET_SPHERES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <div className='h-full bg-dark-gray p-2 flex flex-col gap-2'>
      <PageHeader title="Spheres of Action" />
      <ListSortFilter />
      <div className="spheres-list">
        {spheres.edges.map(({ node } : SphereEdge) => <SphereCard key={node.id} sphere={node} isHeader={false} />)}
      </div>
    </div>
  );
}

export default ListSpheres;
