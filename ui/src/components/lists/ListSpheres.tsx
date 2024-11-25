import {
  Sphere,
  useDeleteSphereMutation,
  useGetSpheresQuery,
} from "../../graphql/generated";

import "./common.css";

import { Spinner, SystemCalendarCard } from "habit-fract-design-system";
import { extractEdges } from "../../graphql/utils";
import { useStateTransition } from "../../hooks/useStateTransition";
import { appStateChangeAtom, currentDayAtom, currentSphereHashesAtom, sphereHasCachedNodesAtom, store } from "../../state";
import { useSetAtom } from "jotai";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useCallback, useMemo } from "react";
import { AppMachine } from "../../main";

function ListSpheres() {
  const [_state, transition] = useStateTransition(); // Top level state machine and routing

  const { loading, error, data } = useGetSpheresQuery();
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data])

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
    transition("Vis", { currentSphereDetails: { ...sphere, ...sphere.metadata } });
  }

  const handleSetCurrentSphere = (sphereId: ActionHashB64) => {
    const state = store.get(appStateChangeAtom);
    state.spheres.currentSphereHash = sphereId;
    store.set(appStateChangeAtom, state);
  };

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
            setSphereIsCurrent={() => handleSetCurrentSphere(sphere.id)}
          />
        )
      })}
    </div>
  );
}

export default ListSpheres;
