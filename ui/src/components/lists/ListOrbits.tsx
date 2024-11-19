import React, { useMemo } from "react";
import "./common.css";

import ListSortFilter from "./ListSortFilter";

import { PlannitCard } from "habit-fract-design-system";
import { Orbit, useDeleteOrbitMutation, useGetOrbitsQuery } from "../../graphql/generated";
import { useSearchableList } from "../../hooks/useSearchableList";
import { extractEdges } from "../../graphql/utils";

interface ListOrbitsProps {}

const ListOrbits: React.FC<ListOrbitsProps> = () => {
  const { loading, error, data } = useGetOrbitsQuery();
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

  return (
    <section className="orbits-list">
      <ListSortFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
        sortOrder={sortOrder}
        onSortOrderChange={toggleSortOrder}
      />
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
  );
};

export default ListOrbits;
