import {
  Sphere,
  useDeleteSphereMutation,
  useGetSpheresQuery,
} from "../../graphql/generated";

import "./common.css";

import { Spinner, SystemCalendarCard } from "habit-fract-design-system";
import { extractEdges } from "../../graphql/utils";
import { useStateTransition } from "../../hooks/useStateTransition";
import { appStateAtom, appStateChangeAtom, currentDayAtom, currentSphereHashesAtom, nodeCache, OrbitNodeDetails, SphereEntry, sphereHasCachedNodesAtom, store, WinDataPerOrbitNode } from "../../state";
import { useSetAtom } from "jotai";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppMachine } from "../../main";
import { DateTime } from "luxon";
import { calculateWinDataForNonLeafNodeAtom } from "../../state/win";

function ListSpheres() {
  const [_state, transition] = useStateTransition();
  const { loading, error, data } = useGetSpheresQuery();
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data]);

  // Get sphere data once at component mount
  const [spheresData, setSpheresData] = useState<Record<string, {
    rootOrbitOrbitDetails: OrbitNodeDetails | null,
    rootOrbitWinData: WinDataPerOrbitNode | null
  }>>({});
  
  useEffect(() => {
    if (!spheres.length) return;

    const newData: Record<string, any> = {};
    spheres.forEach(sphere => {
      const state = store.get(appStateAtom);
      const sphereEntry = Object.values(state.spheres.byHash).find(
        (s: any) => s?.details?.entryHash === sphere.eH
      );
      
      if (!sphereEntry) {
        newData[sphere.eH] = {
          rootOrbitOrbitDetails: null,
          rootOrbitWinData: null
        };
        return;
      }

      const rootOrbitEh = (sphereEntry as SphereEntry).hierarchyRootOrbitEntryHashes[0];
      if (!rootOrbitEh) {
        newData[sphere.eH] = {
          rootOrbitOrbitDetails: null,
          rootOrbitWinData: null
        };
        return;
      }

      const cache = store.get(nodeCache.entries);
      const rootOrbitDetails = cache[rootOrbitEh];
      
      // Only calculate win data if we have orbit details
      let winData = null;
      if (rootOrbitDetails) {
        winData = store.get(calculateWinDataForNonLeafNodeAtom(rootOrbitEh));
      }
      
      newData[sphere.eH] = {
        rootOrbitOrbitDetails: rootOrbitDetails || null,
        rootOrbitWinData: winData
      };
    });

    setSpheresData(newData);
  }, [spheres]);

  if (loading) return <Spinner type="full" />;
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
        const sphereData = spheresData[sphere.eH] || {
          rootOrbitOrbitDetails: null,
          rootOrbitWinData: null
        };
        
        return (
          <SystemCalendarCard
            key={sphere.id}
            sphere={sphere}
            loading={loading}
            rootOrbitWinData={sphereData.rootOrbitWinData}
            rootOrbitOrbitDetails={sphereData.rootOrbitOrbitDetails}
            setSphereIsCurrent={() => handleSetCurrentSphere(sphere.id)}
            handleVisAction={() => transition("Vis", { 
              currentSphereDetails: { ...sphere, ...sphere.metadata } 
            })}
            handleCreateAction={() => transition("CreateOrbit", { 
              sphereEh: sphere.eH 
            })}
            handleListAction={() => transition("ListOrbits", { 
              sphereAh: sphere.id, 
              currentSphereDetails: sphere 
            })}
          />
        );
      })}
    </div>
  );
}

export default ListSpheres;
