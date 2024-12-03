import React, { useMemo } from "react";
import "./common.css";

import { PlannitCard, ListSortFilter, Button, getIconSvg, Spinner } from "habit-fract-design-system";
import { Orbit, useDeleteOrbitMutation, useGetOrbitsQuery } from "../../graphql/generated";
import { useSearchableList } from "../../hooks/useSearchableList";
import { extractEdges } from "../../graphql/utils";
import { useStateTransition } from "../../hooks/useStateTransition";
import { currentSphereDetailsAtom, store } from "../../state";
import { useModal } from "../../contexts/modal";
import { calculateCurrentStreakAtom, calculateLongestStreakAtom } from "../../state/win";

interface ListOrbitsProps { }

const ListOrbits: React.FC<ListOrbitsProps> = () => {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing
  const { showModal } = useModal();

  const currentSphereDetails = store.get(currentSphereDetailsAtom);

  const { loading, error, data } = useGetOrbitsQuery({
    fetchPolicy: "network-only",
    variables: { sphereEntryHashB64: currentSphereDetails.entryHash }
  });

  const [runDelete] = useDeleteOrbitMutation({
    refetchQueries: ["getOrbits"],
  });

  const handleEditPlannit = (orbit: Orbit) => {
    transition("CreateOrbit", { sphereEh: orbit.eH, orbitToEditId: orbit?.id, editMode: true });
  }

  const handleDeletePlannit = (orbit: Orbit) => {
    showModal({
      title: "Are you sure?",
      message: "This action cannot be undone! This will also delete your Win history for this Plannit",
      onConfirm: () => {
        runDelete({ variables: { id: orbit.id } })
      },
      withCancel: true,
      withConfirm: true,
      destructive: true,
      confirmText: "Yes, do it",
      cancelText: "Cancel"
    });
  }

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

  if (loading) return <Spinner />;
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
        <Button onClick={routeToVis} isDisabled={sortedOrbits?.length == 0} type="button" variant="primary responsive">
          <><span className="w-6 h-6 mt-2">{getIconSvg("tree-vis")({})}</span><span className="block ml-4">Visualise</span></>
        </Button>
        <Button onClick={routeToCreateOrbit} type="button" variant="primary responsive">
        <><span className="w-auto h-auto">{getIconSvg("plus")({})}</span><span className="block ml-4">Add Plannit</span></>
        </Button>
        <div className="orbits">
          {sortedOrbits?.length > 0 ? 
            sortedOrbits.map((orbit: Orbit) => (
              <PlannitCard
                key={orbit.id}
                currentStreak={store.get(calculateCurrentStreakAtom(orbit.id))}
                longestStreak={store.get(calculateLongestStreakAtom(orbit.id))}
                lastTrackedWinDate="12/21/2023"
                orbit={orbit}
                handleEditPlannit={() => handleEditPlannit(orbit)}
                runDelete={() => handleDeletePlannit(orbit)}
              />
            )) : <div className="warning-message flex flex-col items-center justify-center w-full h-full gap-4 pb-48">
              <img className="mb-2" src="assets/icons/warning.svg" alt="warning icon" />
              <h1>There are no Planitts<br /> in this System</h1>
              <h2>Add a Planitt to start tracking your behaviour</h2>
            </div> }
        </div>
      </>
    </section>
  );
};

export default ListOrbits;
