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
import { useWinData } from "../../hooks/useWinData";

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
    calculateOptions: {
      useRootFrequency: boolean, // Tell UI components further down to use the orbit's frequency to determine completion, rather than number of winnable descendant leaves
      leafDescendants: number | undefined // If the above flag is false, tell the components what they should calculate completion out of (this is dynamically calculated from the fetched hierarchy data)
    }
  }>>({});

  /**
   * Fetches and then creates/updates AppState data for sphere, sphere hierarchy and sphere hierarchy orbit wins
   * Ensures we have fresh data as the graphql requests are network-only.
   */
  const loadSphereHierarchyData = useCallback(async (sphere: Sphere) => {
    setLoadingStates(prev => ({ ...prev, [sphere.eH]: true }));

    try {
      let state = store.get(appStateAtom);
      let sphereEntry = Object.values(state.spheres.byHash).find(
        (s: any) => s?.details?.entryHash === sphere.eH
      );

      if (!sphereEntry) {
        // Create sphere entry in appstate
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
          // Update sphere entry in appstate
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

          // Process nodes and load win appstate
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
                          [actionHash]: winData || {}
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

          // Update hierarchy appstate
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

        // Update sphere local state
        setSpheresData(prev => ({
          ...prev,
          [sphere.eH]: {
            rootOrbitOrbitDetails: store.get(getOrbitNodeDetailsFromEhAtom(rootOrbitEh)),
            calculateOptions: {
              useRootFrequency: d3Hierarchy.height == 0,
              leafDescendants:  d3Hierarchy.leaves().length
            }
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

        const { workingWinDataForOrbit, handleUpdateWorkingWins, handlePersistWins, numberOfLeafOrbitDescendants } = useWinData(
          sphereData?.rootOrbitOrbitDetails, 
          DateTime.now()
        );
        // Provide extra context to our calendar component for non-leaf (calculated completion) nodes,
        // which use the number of winnable descendant leaf nodes instead of their actual frequency
        const opts = sphereData?.calculateOptions;
        if(workingWinDataForOrbit !== null) {
          workingWinDataForOrbit.useRootFrequency = !!workingWinDataForOrbit.useRootFrequency;
          workingWinDataForOrbit.leafDescendants = opts?.leafDescendants;
        }
        return (
          <SystemCalendarCard
            key={sphere.id}
            sphere={sphere}
            loading={isLoading}
            rootOrbitWinData={workingWinDataForOrbit}
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