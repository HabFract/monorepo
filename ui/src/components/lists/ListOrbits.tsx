import React, { useMemo } from "react";
import "./common.css";

import { PlannitCard, ListSortFilter, Button, getIconSvg } from "habit-fract-design-system";
import { Orbit, useDeleteOrbitMutation, useGetOrbitsQuery } from "../../graphql/generated";
import { useSearchableList } from "../../hooks/useSearchableList";
import { extractEdges } from "../../graphql/utils";
import { useStateTransition } from "../../hooks/useStateTransition";
import { appStateAtom, store } from "../../state";

interface ListOrbitsProps { }

const ListOrbits: React.FC<ListOrbitsProps> = () => {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing

  const currentSphereDetails = store.get(appStateAtom)?.spheres.byHash[params?.sphereAh]?.details;

  const { loading, error, data } = useGetOrbitsQuery({
    fetchPolicy: "network-only",
    variables: { sphereEntryHashB64: currentSphereDetails.entryHash }
  });

  const [runDelete] = useDeleteOrbitMutation({
    refetchQueries: ["getOrbits"],
  });

  // Extract orbits after data is loaded
  const orbits = useMemo(() => {
    if (!data?.orbits) return [];
    return extractEdges(data.orbits) as Orbit[];
  }, [data]);

  const {
    filteredItems: sortedOrbits,
    searchTerm,
    setSearchTerm,
    sortKey,
    setSortKey,
    sortOrder,
    toggleSortOrder
  } = useSearchableList({
    items: orbits,
    searchKeys: ['name', 'scale'],
    initialSortKey: 'name'
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  function routeToCreateOrbit() {
    transition("CreateOrbit", { sphereEh: currentSphereDetails.entryHash });
  }

  function routeToVis() {
    transition("Vis", { currentSphereDetails });
  }

  return (
    <section className="orbits-list">
      <ListSortFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortKey={sortKey}
        onSortKeyChange={setSortKey as any}
        sortOrder={sortOrder}
        onSortOrderChange={toggleSortOrder}
      />

      <>
        <Button onClick={routeToVis} type="button" variant="primary responsive">
          <><span className="w-6 h-6 mt-2">{getIconSvg("tree-vis")({})}</span><span className="block ml-4">Visualise</span></>
        </Button>
        <Button onClick={routeToCreateOrbit} type="button" variant="primary responsive">
        <><span className="w-3 h-3">{getIconSvg("plus")({})}</span><span className="block ml-4">Add Plannit</span></>
        </Button>
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
      </>
    </section>
  );
};

export default ListOrbits;
