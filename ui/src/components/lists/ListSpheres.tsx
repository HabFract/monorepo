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
  NodeContent,
  OrbitNodeDetails,
  store,
  WinDataPerOrbitNode,
} from "../../state";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppMachine } from "../../main";
import { byStartTime, parseAndSortTrees } from "../vis/helpers";
import { hierarchy, HierarchyNode } from "d3-hierarchy";
import { VisCoverage } from "../vis/types";
import { generateQueryParams } from "../vis/tree-helpers";
import { DateTime } from "luxon";

export type nonLeafCompletionCalculationContext = {
  useRootFrequency: boolean; // Tell UI components further down to use the orbit's frequency to determine completion, rather than number of winnable descendant leaves
  leafDescendants: number | undefined; // If the above flag is false, tell the components what they should calculate completion out of (this is dynamically calculated from the fetched hierarchy data)
}

function ListSpheres() {
  const [_state, transition, _params, client] = useStateTransition();
  
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const loadingInitiatedRef = useRef(false);
  const winDataUpdatesRef = useRef<Map<ActionHashB64, any>>(new Map());
  const orbitDataUpdatesRef = useRef<Record<ActionHashB64, any>>({});
  
  const { loading, error, data } = useGetSpheresQuery();
  const [getHierarchy] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "network-only",
  });

  // Sphere data state
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data]);
  const [spheresData, setSpheresData] = useState<Record<string, {
    rootOrbitOrbitDetails: OrbitNodeDetails | null,
    winData: WinDataPerOrbitNode | (WinDataPerOrbitNode & nonLeafCompletionCalculationContext),
    calculateOptions: nonLeafCompletionCalculationContext
  }>>({});
  /**
   * Fetches and then creates/updates AppState data for sphere, sphere hierarchy and sphere hierarchy orbit wins
   * Ensures we have fresh data as the graphql requests are network-only.
   */
  const loadSphereHierarchyData = useCallback(async (sphere: Sphere) => {
    // Clear any previous data for this sphere
    setSpheresData(prev => {
      const newData = { ...prev };
      delete newData[sphere.eH];
      return newData;
    });
  
    setLoadingStates(prev => ({ ...prev, [sphere.eH]: true }));
    
    winDataUpdatesRef.current = new Map();
    orbitDataUpdatesRef.current = {};
    let d3Hierarchy: any = null;
    let parsedTrees: any = null;
  
    try {
      const state = store.get(appStateAtom);
      
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
  
      // Parse hierarchy data with cleanup
      const trees = JSON.parse(hierarchyData.getOrbitHierarchy);
      if (!trees) return;
  
      parsedTrees = parseAndSortTrees(trees);
      const rootOrbitEh = parsedTrees[0].content;
      
      // Create hierarchy with cleanup
      d3Hierarchy = hierarchy(parsedTrees[0]).sort(byStartTime);
  
      const nodeHashes: string[] = [];
      const leafNodeHashes: string[] = [];
      const leaves: HierarchyNode<NodeContent>[] = [];
      winDataUpdatesRef.current = new Map();
      orbitDataUpdatesRef.current = {};

      // Process nodes in batches to prevent memory spikes
      const batchSize = 50;
      const nodes = d3Hierarchy.descendants();
      
      for (let i = 0; i < nodes.length; i += batchSize) {
        const batch = nodes.slice(i, i + batchSize);
        
        batch.forEach(node => {
          if (!node.data?.content) return;
          const actionHash = store.get(getOrbitIdFromEh(node.data.content));
          nodeHashes.push(actionHash);
          orbitDataUpdatesRef.current![actionHash] = {
            eH: node.data.content,
          };
          if (!node.children || node.children.length === 0) {
            leafNodeHashes.push(actionHash);
            leaves.push(node)
          }
        });
  
        // Allow garbage collection between batches
        await new Promise(resolve => setTimeout(resolve, 0));
      }
  
      // Process win data in batches
      const today = DateTime.now();
      
      for (let i = 0; i < leaves.length; i += batchSize) {
        const batch = leaves.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async node => {
          if (!node.data?.content) return;
          if(!winDataUpdatesRef.current) return;
          
          const actionHash = store.get(getOrbitIdFromEh(node.data.content));

          const winData = await fetchWinDataForOrbit(client, node.data.content, today);
          if (winData) {
            winDataUpdatesRef.current!.set(actionHash, winData);
          }
        }));
  
        // Allow garbage collection between batches
        await new Promise(resolve => setTimeout(resolve, 0));
      }
  
      // Single atomic state update
      store.set(appStateAtom, {
        ...state,
        spheres: {
          ...state.spheres,
          byHash: {
            ...state.spheres.byHash,
            [sphere.id]: {
              details: { entryHash: sphere.eH, name: sphere.name },
              hierarchyRootOrbitEntryHashes: [rootOrbitEh]
            }
          }
        },
        orbitNodes: {
          ...state.orbitNodes,
          byHash: {
            ...state.orbitNodes.byHash,
            ...orbitDataUpdatesRef.current
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
          ...Object.fromEntries(winDataUpdatesRef.current)
        }
      });
      const rootOrbitDetails = store.get(getOrbitNodeDetailsFromEhAtom(rootOrbitEh));
      // Update local state
      setSpheresData(prev => ({
        ...prev,
        [sphere.eH]: {
          rootOrbitOrbitDetails: rootOrbitDetails,
          winData: Object.fromEntries(winDataUpdatesRef.current! || {}),
          calculateOptions: {
            useRootFrequency: d3Hierarchy?.height === 0,
            leafDescendants: leaves.length
          }
        }
      }));
    } catch (error) {
      console.error(`Error loading hierarchy data for sphere ${sphere.eH}:`, error);
      
    } finally {
      setLoadingStates(prev => ({ ...prev, [sphere.eH]: false }));
      // Cleanup references
      d3Hierarchy = null;
      parsedTrees = null;
      // GC for working update map, since a weak map doesn't allow enumeration
      winDataUpdatesRef.current = new Map();
      orbitDataUpdatesRef.current = {};
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