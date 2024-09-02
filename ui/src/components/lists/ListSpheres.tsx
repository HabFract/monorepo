import { listSortFilterAtom } from '../../state/listSortFilterAtom';
import { Sphere, useDeleteSphereMutation, useGetSpheresQuery } from '../../graphql/generated';

import './common.css';

import PageHeader from '../header/PageHeader';
import { SphereCard } from 'habit-fract-design-system';
import { extractEdges } from '../../graphql/utils';
import { useStateTransition } from '../../hooks/useStateTransition';
import { store } from '../../state/jotaiKeyValueStore';

function ListSpheres() {
  const [runDelete, { loading: loadingDelete, error: errorDelete, data: dataDelete }] = useDeleteSphereMutation({
    refetchQueries: [
      'getSpheres',
    ],
  });

  const { loading, error, data } = useGetSpheresQuery();

  const listSortFilter = store.get(listSortFilterAtom);
  const [_state, transition] = useStateTransition(); // Top level state machine and routing

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const spheres = extractEdges(data!.spheres) as Sphere[];

  if(!spheres.length) return <></>;

  return (
    <div className='layout spheres'>
      <PageHeader title="Sphere Breakdown" />
      <div></div>
      <div className="spheres-list">
        {spheres.map((sphere : Sphere) => <SphereCard key={sphere.id} sphere={sphere} transition={transition} isHeader={false} orbitScales={[]} runDelete={() => runDelete({variables: {id: sphere.id}})}/>)}</div>
    </div>
  );
}

export default ListSpheres;
