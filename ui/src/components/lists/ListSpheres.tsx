import {
  Sphere,
  useDeleteSphereMutation,
  useGetSpheresQuery,
} from "../../graphql/generated";

import "./common.css";

import { Spinner, SystemCalendarCard } from "habit-fract-design-system";
import { extractEdges } from "../../graphql/utils";
import { useStateTransition } from "../../hooks/useStateTransition";
import { useToast } from "../../contexts/toast";
import { currentDayAtom, currentSphereHashesAtom, sphereHasCachedNodesAtom, store } from "../../state";
import { useSetAtom } from "jotai";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useEffect, useMemo } from "react";
import { AppMachine } from "../../main";

function ListSpheres() {
  const [_state, transition] = useStateTransition(); // Top level state machine and routing

  const { loading, error, data } = useGetSpheresQuery();
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data])
  const sphereOrbitsAllCached = useMemo(() => {
    return spheres && spheres.every(sphere => store.get(sphereHasCachedNodesAtom(sphere.id)))}, [spheres])

  const { showToast, hideToast } = useToast();
  const setCurrentSphere = useSetAtom(currentSphereHashesAtom);

  if (loading) return <Spinner />;
  if (error) return <p>Error : {error.message}</p>;

  if (!spheres.length) return <></>;

  function routeToCreatePlannit(sphereEh: EntryHashB64) {
    transition("CreateOrbit", { sphereEh });
  }
  function routeToPlannitList(sphereId: ActionHashB64) {
    transition("ListOrbits", { sphereAh: sphereId, currentSphereDetails: spheres.find(sphere => sphere.id == sphereId) });
  }
  function routeToVis(sphere: Sphere) {
    AppMachine.state.currentState == "Vis";
    console.log('{currentSphereDetails: {...sphere, ...sphere.metadata}} :>> ', {currentSphereDetails: {...sphere, ...sphere.metadata}});
    transition("Vis", {currentSphereDetails: {...sphere, ...sphere.metadata}});
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
            handleCreateAction={() => routeToCreatePlannit(sphere.eH)}
            handleListAction={() => routeToPlannitList(sphere.id)}
            handleVisAction={() => routeToVis(sphere)}
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
