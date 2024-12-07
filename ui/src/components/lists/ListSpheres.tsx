import {
  Sphere,
  useDeleteSphereMutation,
  useGetOrbitHierarchyLazyQuery,
  useGetSpheresQuery,
} from "../../graphql/generated";
import "./common.css";
import { Spinner, SystemCalendarCard } from "habit-fract-design-system";
import { extractEdges } from "../../graphql/utils";
import { useStateTransition } from "../../hooks/useStateTransition";
import { 
  appStateAtom, 
  appStateChangeAtom, 
  getOrbitIdFromEh, 
  getOrbitNodeDetailsFromEhAtom, 
  OrbitNodeDetails, 
  store, 
  WinDataPerOrbitNode 
} from "../../state";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppMachine } from "../../main";
import { calculateWinDataForNonLeafNodeAtom } from "../../state/win";
import { DataLoadingQueue } from "../PreloadAllData";
import { sleep } from "./OrbitSubdivisionList";
import { byStartTime, parseAndSortTrees } from "../vis/helpers";
import { hierarchy } from "d3-hierarchy";
import { VisCoverage } from "../vis/types";
import { determineVisCoverage, generateQueryParams } from "../vis/tree-helpers";

function ListSpheres() {
  const [_state, transition] = useStateTransition();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const loadingInitiatedRef = useRef(false);
  const dataLoadingQueue = useMemo(() => new DataLoadingQueue(), []);

  const { loading, error, data } = useGetSpheresQuery();
  const [getHierarchy] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "cache-first",
  });

  // Sphere data state
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data]);
  const [spheresData, setSpheresData] = useState<Record<string, {
    rootOrbitOrbitDetails: OrbitNodeDetails | null,
    rootOrbitWinData: WinDataPerOrbitNode | null
  }>>({});

  const loadSphereHierarchyData = useCallback(async (sphere: Sphere) => {
    setLoadingStates(prev => ({ ...prev, [sphere.eH]: true }));

    try {
      let state = store.get(appStateAtom);
      let sphereEntry = Object.values(state.spheres.byHash).find(
        (s: any) => s?.details?.entryHash === sphere.eH
      );

      // If sphere entry doesn't exist, create it
      if (!sphereEntry) {
        console.log('Creating sphere entry for:', sphere.eH);
        
        const newState = {
          ...state,
          spheres: {
            ...state.spheres,
            byHash: {
              ...state.spheres.byHash,
              [sphere.id]: {
                details: {
                  entryHash: sphere.eH,
                  actionHash: sphere.id,
                  name: sphere.name
                },
                hierarchyRootOrbitEntryHashes: [] // Start with empty array
              }
            }
          }
        };
        store.set(appStateAtom, newState);
        sphereEntry = newState.spheres.byHash[sphere.id];
      }

      // Fetch hierarchy data
      const visCoverage = VisCoverage.CompleteSphere;
      const getQueryParams = generateQueryParams(visCoverage, sphere.eH);
      const queryParams = getQueryParams(0);

      if (!queryParams) {
        console.warn('Failed to generate query params for sphere:', sphere.eH);
        return;
      }

      const { data: hierarchyData } = await getHierarchy({ 
        variables: { params: queryParams } 
      });

      if (hierarchyData?.getOrbitHierarchy) {
        const trees = JSON.parse(hierarchyData.getOrbitHierarchy);
        if (!trees) {
          console.warn('Failed to parse hierarchy trees for sphere:', sphere.eH);
          return;
        }

        const parsedTrees = parseAndSortTrees(trees);
        const json = JSON.stringify(parsedTrees[0]); // Use first tree
        const d3Hierarchy = hierarchy(JSON.parse(json)).sort(byStartTime);

        // Get root orbit EH from the first tree
        const rootOrbitEh = parsedTrees[0].content;

        // Update sphere entry with root orbit EH

        state = store.get(appStateAtom);
        const updatedState = {
          ...store.get(appStateAtom),
          spheres: {
            ...state.spheres,
            byHash: {
              ...state.spheres.byHash,
              [sphere.id]: {
                ...state.spheres.byHash[sphere.id], // Preserve existing sphere data
                details: {
                  entryHash: sphere.eH,
                  name: sphere.name
                },
                hierarchyRootOrbitEntryHashes: [rootOrbitEh]
              }
            }
          }
        };
        store.set(appStateAtom, updatedState);

        // Extract node hashes
        const nodeHashes: string[] = [];
        const leafNodeHashes: string[] = [];
        
        d3Hierarchy.each(node => {
          if (!node.data?.content) {
            console.warn('Node missing content:', node);
            return;
          }
          const actionHash = store.get(getOrbitIdFromEh(node.data.content))
          nodeHashes.push(actionHash);
          if (!node.children || node.children.length === 0) {
            leafNodeHashes.push(actionHash);
          }
        });

        // Create hierarchy object
        const fullHierarchy = {
          rootNode: rootOrbitEh,
          json: JSON.stringify(parsedTrees),
          nodeHashes,
          leafNodeHashes,
          bounds: undefined,
          indices: { x: 0, y: 0 },
          currentNode: rootOrbitEh
        };

        // Update app state with hierarchy
        state = store.get(appStateAtom);
        const updatedState2 = {
          ...state,
          hierarchies: {
            ...state.hierarchies,
            byRootOrbitEntryHash: {
              ...state.hierarchies.byRootOrbitEntryHash,
              [rootOrbitEh]: {
                ...state.hierarchies.byRootOrbitEntryHash[rootOrbitEh],  // Preserve any existing data
                ...fullHierarchy  // Spread new data
              }
            }
          }
        };
console.log('updatedState2 :>> ', updatedState2);
        store.set(appStateAtom, updatedState2);
        // Update sphere data
        const winData = store.get(calculateWinDataForNonLeafNodeAtom(rootOrbitEh));
        setSpheresData(prev => ({
          ...prev,
          [sphere.eH]: {
            rootOrbitOrbitDetails: store.get(getOrbitNodeDetailsFromEhAtom(rootOrbitEh)),
            rootOrbitWinData: winData
          }
        }));
      }
    } catch (error) {
      console.error(`Error loading hierarchy data for sphere ${sphere.eH}:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sphere.eH]: false }));
    }
  }, [getHierarchy]);

  // Queue up loading of hierarchy data for each sphere
  useEffect(() => {
    if (!spheres.length || loadingInitiatedRef.current) return;

    loadingInitiatedRef.current = true;
    spheres.forEach(sphere => {
      dataLoadingQueue.enqueue(async () => {
        await loadSphereHierarchyData(sphere);
      });
    });

    return () => {
      loadingInitiatedRef.current = false;
    };
  }, [spheres, loadSphereHierarchyData, dataLoadingQueue]);

  const routeToCreatePlanitt = (sphereEh: EntryHashB64) => {
    transition("CreateOrbit", { sphereEh });
  };

  const routeToPlanittList = (sphereId: ActionHashB64) => {
    transition("ListOrbits", { 
      sphereAh: sphereId, 
      currentSphereDetails: spheres.find(sphere => sphere.id === sphereId) 
    });
  };

  const routeToVis = (sphere: Sphere) => {
    AppMachine.state.currentState = "Vis";
    transition("Vis", { currentSphereDetails: { ...sphere, ...sphere.metadata } });
  };

  const handleSetCurrentSphere = (sphereId: ActionHashB64) => {
    const state = store.get(appStateChangeAtom);
    state.spheres.currentSphereHash = sphereId;
    store.set(appStateChangeAtom, state);
  };

  if (loading) return <Spinner type="full" />;
  if (error) return <p>Error: {error.message}</p>;
  if (!spheres.length) return <></>;

  return (
    <div className="spheres-list">
      {spheres.map((sphere: Sphere) => {
        const isLoading = loadingStates[sphere.eH];
        const sphereData = spheresData[sphere.eH] || {};
        return (
          <SystemCalendarCard
            key={sphere.id}
            sphere={sphere}
            loading={isLoading}
            rootOrbitWinData={sphereData?.rootOrbitWinData}
            rootOrbitOrbitDetails={sphereData?.rootOrbitOrbitDetails}
            setSphereIsCurrent={() => handleSetCurrentSphere(sphere.id)}
            handleVisAction={() => routeToVis(sphere)}
            handleCreateAction={() => routeToCreatePlanitt(sphere.eH)}
            handleListAction={() => routeToPlanittList(sphere.id)}
          />
        );
      })}
    </div>
  );
}

export default ListSpheres;