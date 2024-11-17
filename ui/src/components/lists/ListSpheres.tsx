import {
  Sphere,
  useDeleteSphereMutation,
  useGetSpheresQuery,
} from "../../graphql/generated";

import "./common.css";

import { SystemCalendarCard } from "habit-fract-design-system";
import { extractEdges } from "../../graphql/utils";
import { useStateTransition } from "../../hooks/useStateTransition";
import { useToast } from "../../contexts/toast";
import { currentDayAtom, currentSphereHashesAtom, sphereHasCachedNodesAtom, store } from "../../state";
import { useSetAtom } from "jotai";
import { ActionHashB64 } from "@holochain/client";
import { useEffect, useMemo } from "react";

function ListSpheres() {
  const [_state, transition] = useStateTransition(); // Top level state machine and routing
  const [
    runDelete,
    { loading: loadingDelete, error: errorDelete, data: dataDelete },
  ] = useDeleteSphereMutation({
    refetchQueries: ["getSpheres"],
  });

  const { loading, error, data } = useGetSpheresQuery();
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data])
  const sphereOrbitsAllCached = useMemo(() => {
    return spheres && spheres.every(sphere => store.get(sphereHasCachedNodesAtom(sphere.id)))}, [spheres])

  const { showToast, hideToast } = useToast();
  const setCurrentSphere = useSetAtom(currentSphereHashesAtom);

  useEffect(() => {
    if(!data?.spheres) return;
    console.log('sphereOrbitsAllCached :>> ', sphereOrbitsAllCached, spheres.map(sphere => store.get(sphereHasCachedNodesAtom(sphere.id))));
    
  }, [data?.spheres]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  if (!spheres.length) return <></>;
  function routeToPlannitList(sphereId: ActionHashB64) {
    transition("ListOrbits", { sphereAh: sphereId });
  }
  function routeToVis(sphere: Sphere) {
    transition?.("Vis", {currentSphereDetails: sphere});
  }

  return (
    <div className="spheres-list">
      {spheres.map((sphere: Sphere) => {
        return (
          <SystemCalendarCard
            currentDate={store.get(currentDayAtom)}
            currentWins={{}}
            key={sphere.id}
            sphere={sphere}
            handleListAction={() => routeToPlannitList(sphere.id)}
            handleVisAction={() => routeToVis(sphere)}
            runDelete={() => runDelete({ variables: { id: sphere.id } })}
            setSphereIsCurrent={() => {
              setCurrentSphere({
                entryHash: sphere.eH,
                actionHash: sphere.id,
              });
            }}
          />
        )
      })}
    </div>
  );
}

export default ListSpheres;
