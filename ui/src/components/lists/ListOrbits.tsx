import React from "react";
import "./common.css";

import PageHeader from "../header/PageHeader";
import ListSortFilter from "./ListSortFilter";

import { OrbitCard, SphereCard } from "habit-fract-design-system";
import { Orbit, useDeleteOrbitMutation } from "../../graphql/generated";
import { useStateTransition } from "../../hooks/useStateTransition";
import { useFetchAndCacheSphereOrbits } from "../../hooks/useFetchAndCacheSphereOrbits";
import { useSortedOrbits } from "../../hooks/useSortedOrbits";
import { ActionHashB64 } from "@holochain/client";
import { Spinner } from "flowbite-react";
import { useToast } from "../../contexts/toast";
import { currentSphereHashesAtom, sphereHasCachedNodesAtom, store } from "../../state";

interface ListOrbitsProps {
  sphereAh?: ActionHashB64; // Optional prop to filter orbits by sphere
}

const ListOrbits: React.FC<ListOrbitsProps> = ({
  sphereAh,
}: ListOrbitsProps) => {
  const [_state, transition] = useStateTransition(); // Top level state machine and routing

  const { showToast, hideToast } = useToast();
  // TODO: make a modal on this list page, which is triggered before the following hook. This might be a repeated functionality on different pages so much be better to make a HOC.
  const [
    runDelete,
    { loading: loadingDelete, error: errorDelete, data: dataDelete },
  ] = useDeleteOrbitMutation({
    refetchQueries: ["getOrbits"],
  });
  const {
    loading: loadingOrbits,
    error,
    data,
  } = useFetchAndCacheSphereOrbits({ sphereAh });

  const sortedOrbits: Orbit[] = useSortedOrbits(data?.orbits);
  const loading = !sphereAh || loadingOrbits;
  if (loading)
    return <Spinner aria-label="Loading!" className="full-spinner" size="xl" />;
  if (error) return <p>Error : {error.message}</p>;
  return (
    <div className="layout orbits">
      <PageHeader title="Orbit Breakdown " />
      {data?.sphere && (
        <SphereCard
          sphere={data.sphere}
          isHeader={true}
          transition={transition}
          orbitScales={data.orbits.map((orbit: Orbit) => orbit?.scale)}
          showToast={showToast}
          hasCachedNodes={store.get(sphereHasCachedNodesAtom(data?.sphere.id))}
        />
      )}
      <ListSortFilter label={""} />
      <div className="orbits-list">
        {sortedOrbits.map((orbit: Orbit) => (
          <OrbitCard
            key={orbit.id}
            sphereEh={data!.sphere.eH}
            transition={transition}
            orbit={orbit}
            runDelete={() => runDelete({ variables: { id: orbit.id } })}
          />
        ))}
      </div>
    </div>
  );
};

export default ListOrbits;
