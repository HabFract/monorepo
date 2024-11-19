import React from "react";
import "./common.css";

import ListSortFilter from "./ListSortFilter";

import { getIconSvg, HeaderAction, PlannitCard } from "habit-fract-design-system";
import { Orbit, useDeleteOrbitMutation } from "../../graphql/generated";
import { useStateTransition } from "../../hooks/useStateTransition";
import { useFetchAndCacheSphereOrbits } from "../../hooks/useFetchAndCacheSphereOrbits";
import { useSortedOrbits } from "../../hooks/useSortedOrbits";
import { ActionHashB64 } from "@holochain/client";
import { Spinner } from "flowbite-react";
import { useToast } from "../../contexts/toast";
import { appStateAtom, store } from "../../state";

interface ListOrbitsProps {
  sphereAh?: ActionHashB64; // Optional prop to filter orbits by sphere
}

const ListOrbits: React.FC<ListOrbitsProps> = ({
  sphereAh,
}: ListOrbitsProps) => {
  const [_state, transition] = useStateTransition(); // Top level state machine and routing

  const { showToast, hideToast } = useToast();
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

  const currentAppState = store.get(appStateAtom);
  const listedSphere = currentAppState.spheres.byHash[sphereAh!]

  const sortedOrbits: Orbit[] = useSortedOrbits(data?.orbits);
  const loading = !sphereAh || loadingOrbits;
  if (loading)
    return <Spinner aria-label="Loading!" className="full-spinner" size="xl" />;
  if (error) return <p>Error : {error.message}</p>;
  return (
    <>
      <section className="orbits-list">
        <ListSortFilter label={""} />
        <div className="orbits">
          {sortedOrbits.map((orbit: Orbit) => (
            <PlannitCard
              key={orbit.id}
              currentStreak={1}
              longestStreak={2}
              lastTrackedWinDate="12/21/2023"
              orbit={orbit}
              runDelete={() => runDelete({ variables: { id: orbit.id } })}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default ListOrbits;
