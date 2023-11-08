import { useQuery } from '@apollo/client';
import GET_SPHERES from '../graphql/queries/sphere/getSpheres.graphql';
import PageHeader from './PageHeader';
import ListSortFilter from './ListSortFilter';
import SphereCard from '../../../design-system/cards/SphereCard';

function ListSpheres() {
  const { loading, error, data } = useQuery(GET_SPHERES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <div>
      <PageHeader title="List of Spheres" />
      <ListSortFilter />
      <div className="spheres-list">
        {data.spheres.edges.map(({ node }) => <SphereCard key={node.id} sphere={node} />)}
      </div>
    </div>
  );
}

export default ListSpheres;
