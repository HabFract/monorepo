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
} from "../../state";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppMachine } from "../../main";
import { calculateWinDataForNonLeafNodeAtom } from "../../state/win";
import { byStartTime, parseAndSortTrees } from "../vis/helpers";
import { hierarchy } from "d3-hierarchy";
import { VisCoverage } from "../vis/types";
import { generateQueryParams } from "../vis/tree-helpers";
import { DateTime } from "luxon";

function ListSpheres() {
  const [_state, transition, params, client] = useStateTransition();

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const loadingInitiatedRef = useRef(false);

  const { loading, error, data } = useGetSpheresQuery();
  const [getHierarchy] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "network-only",
  });

  // Sphere data state
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data]);
  const [spheresData, setSpheresData] = useState<Record<string, {
    rootOrbitOrbitDetails: OrbitNodeDetails | null,
    winData: any,
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
      const state = store.get(appStateAtom);
    
      // Check for existing sphere entry
      const sphereEntry = Object.values(state.spheres.byHash).find(
        (s: any) => s?.details?.entryHash === sphere.eH
      );
  
      // Create base state update
      const baseStateUpdate = sphereEntry ? {} : {
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
  
      // Fetch hierarchy data
      const visCoverage = VisCoverage.CompleteSphere;
      const queryParams = generateQueryParams(visCoverage, sphere.eH)(0);
  
      if (!queryParams) {
        console.warn('Failed to generate query params for sphere:', sphere.eH);
        return;
      }
  
      const { data: hierarchyData } = await getHierarchy({
        variables: { params: queryParams }
      });
  
      if (!hierarchyData?.getOrbitHierarchy) return;
  
      // Parse hierarchy data
      const trees = JSON.parse(hierarchyData.getOrbitHierarchy);
      if (!trees) return;
  
      const parsedTrees = parseAndSortTrees(trees);
      const rootOrbitEh = parsedTrees[0].content;
      
      // Create hierarchy once
      const d3Hierarchy = hierarchy(JSON.parse(JSON.stringify(parsedTrees[0]))).sort(byStartTime);
  
      // Collect all necessary data first
      const nodeHashes: string[] = [];
      const leafNodeHashes: string[] = [];
      const winDataUpdates: Record<string, any> = {};
      const orbitNodesUpdates: Record<string, any> = {};
  
      // Process all nodes first to build orbitNodes state
      d3Hierarchy.each(node => {
        if (!node.data?.content) return;
        
        const actionHash = store.get(getOrbitIdFromEh(node.data.content));
        nodeHashes.push(actionHash);
  
        // Populate orbitNodes state
        orbitNodesUpdates[actionHash] = {
          ...state.orbitNodes.byHash[actionHash],
          details: {
            entryHash: node.data.content,
            actionHash,
            // Preserve any existing details
            ...state.orbitNodes.byHash[actionHash]?.details,
            // Add new node data
            ...node.data
          }
        };
  
        if (!node.children || node.children.length === 0) {
          leafNodeHashes.push(actionHash);
        }
      });
  
      // Process win data for leaf nodes
      const today = DateTime.now();
      const winDataPromises = d3Hierarchy.leaves().map(async node => {
        if (!node.data?.content) return;
        
        const actionHash = store.get(getOrbitIdFromEh(node.data.content));
        const winData = await fetchWinDataForOrbit(client, node.data.content, today);
        if (winData) {
          winDataUpdates[actionHash] = winData;
        }
      });
  
      await Promise.all(winDataPromises);
  
      // Create single state update
      const finalStateUpdate = {
        ...baseStateUpdate,
        spheres: {
          ...state.spheres,
          byHash: {
            ...state.spheres.byHash,
            [sphere.id]: {
              ...state.spheres.byHash[sphere.id],
              details: { entryHash: sphere.eH, name: sphere.name },
              hierarchyRootOrbitEntryHashes: [rootOrbitEh]
            }
          }
        },
        orbitNodes: {
          ...state.orbitNodes,
          byHash: {
            ...state.orbitNodes.byHash,
            ...orbitNodesUpdates
          }
        },
        hierarchies: {
          ...state.hierarchies,
          byRootOrbitEntryHash: {
            ...state.hierarchies.byRootOrbitEntryHash,
            [rootOrbitEh]: {
              rootNode: rootOrbitEh,
              json: JSON.stringify(parsedTrees),
              nodeHashes,
              leafNodeHashes,
              bounds: undefined,
              indices: { x: 0, y: 0 },
              currentNode: rootOrbitEh
            }
          }
        },
        wins: {
          ...state.wins,
          ...winDataUpdates
        }
      };
  
      // Single state update
      store.set(appStateAtom, finalStateUpdate);
      const rootOrbitDetails = store.get(getOrbitNodeDetailsFromEhAtom(rootOrbitEh))
      // Update sphere local state to make available to renderer
      setSpheresData(prev => ({
        ...prev,
        [sphere.eH]: {
          rootOrbitOrbitDetails: rootOrbitDetails,
          calculateOptions: {
            useRootFrequency: d3Hierarchy.height === 0,
            leafDescendants: d3Hierarchy.leaves().length
          },
          winData: store.get(calculateWinDataForNonLeafNodeAtom(rootOrbitDetails?.eH)),
        }
      }));
  
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
        // await loadSphereHierarchyData(sphere);

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
  }, [spheres]);

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

        const workingWinDataForOrbit = sphereData.rootOrbitOrbitDetails ? {
          ...sphereData.winData,
        } : null;

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