import {
  Sphere,
  useDeleteSphereMutation,
  useGetOrbitHierarchyLazyQuery,
  useGetSpheresQuery,
} from "../../graphql/generated";
import "./common.css";
import { Spinner, SystemCalendarCard, toYearDotMonth } from "habit-fract-design-system";
import { extractEdges, fetchWinDataForOrbit } from "../../graphql/utils";
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
import { byStartTime, parseAndSortTrees } from "../vis/helpers";
import { hierarchy } from "d3-hierarchy";
import { VisCoverage } from "../vis/types";
import { generateQueryParams } from "../vis/tree-helpers";
import { DateTime } from "luxon";

function ListSpheres() {
  const [_state, transition, params, client] = useStateTransition();

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const loadingInitiatedRef = useRef(false);
  const dataLoadingQueue = useMemo(() => new DataLoadingQueue(), []);

  const { loading, error, data } = useGetSpheresQuery();
  const [getHierarchy] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "network-only",
  });

  // Sphere data state
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data]);
  const [spheresData, setSpheresData] = useState<Record<string, {
    rootOrbitOrbitDetails: OrbitNodeDetails | null,
    rootOrbitWinData: WinDataPerOrbitNode | null
  }>>({});

  // Debug effect to track state updates
  useEffect(() => {
    const state = store.get(appStateAtom);
    console.log('state.spheres :>> ', state.spheres);
    console.log("Current app state:", {
      spheresCount: Object.keys(state.spheres.byHash).length,
      hierarchiesCount: Object.keys(state.hierarchies.byRootOrbitEntryHash).length,
      hierarchyData: state.hierarchies.byRootOrbitEntryHash,
      sphereData: state.spheres.byHash
    });
  }, [spheres]);

  const loadSphereHierarchyData = useCallback(async (sphere: Sphere) => {
    setLoadingStates(prev => ({ ...prev, [sphere.eH]: true }));

    try {
      let state = store.get(appStateAtom);
      let sphereEntry = Object.values(state.spheres.byHash).find(
        (s: any) => s?.details?.entryHash === sphere.eH
      );

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
                hierarchyRootOrbitEntryHashes: []
              }
            }
          }
        };
        store.set(appStateAtom, newState);
        sphereEntry = newState.spheres.byHash[sphere.id];
      }

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
        const json = JSON.stringify(parsedTrees[0]);
        const d3Hierarchy = hierarchy(JSON.parse(json)).sort(byStartTime);
        const rootOrbitEh = parsedTrees[0].content;

        // Update all state atomically
        await Promise.all([
          // Update sphere entry
          new Promise<void>(resolve => {
            const updatedState = {
              ...store.get(appStateAtom),
              spheres: {
                ...state.spheres,
                byHash: {
                  ...state.spheres.byHash,
                  [sphere.id]: {
                    ...state.spheres.byHash[sphere.id],
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
            resolve();
          }),

          // Process nodes and load win data
          new Promise<void>(async resolve => {
            const nodeHashes: string[] = [];
            const leafNodeHashes: string[] = [];
            const winDataPromises: Promise<void>[] = [];

            d3Hierarchy.each(node => {
              if (!node.data?.content) {
                console.warn('Node missing content:', node);
                return;
              }
              const actionHash = store.get(getOrbitIdFromEh(node.data.content));
              nodeHashes.push(actionHash);
              
              if (node.data.children && node.data.children.length === 0) {
                console.log('actionHash is leaf node:', actionHash);
                leafNodeHashes.push(actionHash);

                const today = DateTime.now();
                winDataPromises.push(
                  fetchWinDataForOrbit(client, node.data.content, today).then(winData => {
                    if (winData) {
                      const state = store.get(appStateAtom);
                      store.set(appStateAtom, {
                        ...state,
                        wins: {
                          ...state.wins,
                          [actionHash]: winData
                        }
                      });
                    }
                  })
                );
              }
            });

            await Promise.all(winDataPromises);
            resolve();
          }),

          // Update hierarchy data
          new Promise<void>(resolve => {
            const state = store.get(appStateAtom);
            const fullHierarchy = {
              rootNode: rootOrbitEh,
              json: JSON.stringify(parsedTrees),
              nodeHashes: d3Hierarchy.descendants().map(n => store.get(getOrbitIdFromEh(n.data.content))),
              leafNodeHashes: d3Hierarchy.leaves().map(n => store.get(getOrbitIdFromEh(n.data.content))),
              bounds: undefined,
              indices: { x: 0, y: 0 },
              currentNode: rootOrbitEh
            };

            const updatedState = {
              ...state,
              hierarchies: {
                ...state.hierarchies,
                byRootOrbitEntryHash: {
                  ...state.hierarchies.byRootOrbitEntryHash,
                  [rootOrbitEh]: fullHierarchy
                }
              }
            };
            store.set(appStateAtom, updatedState);
            resolve();
          })
        ]);

        // Verify hierarchy data was properly loaded
        const finalState = store.get(appStateAtom);
        const hierarchyLoaded = finalState.hierarchies.byRootOrbitEntryHash[rootOrbitEh]?.json;
        
        if (!hierarchyLoaded) {
          throw new Error(`Failed to load hierarchy data for sphere ${sphere.eH}`);
        }

        const winData = store.get(calculateWinDataForNonLeafNodeAtom(rootOrbitEh));
        if(d3Hierarchy.height == 0) {
          console.log("Root is only child, don't calculate cumulative completion")
          winData.useRootFrequency = true; // Pass flag for outlier case were there is only one node and we don't calculate accumulated completion
        } else {
          winData.leafDescendants = d3Hierarchy.leaves().length; // Pass number of leaf descendants to use instead
        }
        console.log('winData?.leafDescendants :>> ', winData?.leafDescendants);
        // Update sphere data
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
  }, [getHierarchy, client]);

  useEffect(() => {
    if (!spheres.length || loadingInitiatedRef.current) return;

    loadingInitiatedRef.current = true;
    
    const processQueue = async () => {
      for (const sphere of spheres) {
        await loadSphereHierarchyData(sphere);
        
        // Verify data was loaded correctly
        const state = store.get(appStateAtom);
        const sphereEntry = state.spheres.byHash[sphere.id];
        const rootOrbitEh = sphereEntry?.hierarchyRootOrbitEntryHashes?.[0];
        
        if (!rootOrbitEh || !state.hierarchies.byRootOrbitEntryHash[rootOrbitEh]) {
          console.error(`Failed to verify data loading for sphere ${sphere.eH}`);
          continue;
        }
      }
    };

    processQueue().finally(() => {
      loadingInitiatedRef.current = false;
    });

    return () => {
      loadingInitiatedRef.current = false;
    };
  }, [spheres, loadSphereHierarchyData]);

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