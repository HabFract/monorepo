/**
 * ListSpheres.tsx
 * Component for displaying and managing a list of spheres with their associated orbit hierarchies and win data.
 */

import {
  Sphere,
  useDeleteSphereMutation,
  useGetOrbitHierarchyLazyQuery,
  useGetSpheresQuery,
} from "../../graphql/generated";
import "./common.css";
import { Spinner, SystemCalendarCard } from "habit-fract-design-system";
import { extractEdges, fetchWinDataForOrbit } from "../../graphql/utils";
import { useStateTransition } from "../../hooks/useStateTransition";
import {
  appStateChangeAtom,
  getOrbitIdFromEh,
  getOrbitNodeDetailsFromEhAtom,
  NodeContent,
  OrbitNodeDetails,
  store,
  WinDataPerOrbitNode,
} from "../../state";
import { ActionHashB64, EntryHashB64 } from "@state/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppMachine } from "../../main";
import { byStartTime, parseAndSortTrees } from "../vis/helpers";
import { hierarchy, HierarchyNode } from "d3-hierarchy";
import { VisCoverage } from "../vis/types";
import { generateQueryParams } from "../vis/tree-helpers";
import { DateTime } from "luxon";

/** Debug flag for development logging */
const DEBUG = false;

/**
 * Helper function for debug logging
 * @param args Arguments to log
 */
const debugLog = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

/**
 * Type definition for non-leaf orbit completion calculation context
 */
export type nonLeafCompletionCalculationContext = {
  /** Tell UI components to use orbit frequency instead of descendant count */
  useRootFrequency: boolean;
  /** Number of winnable descendant leaves for completion calculation */
  leafDescendants: number | undefined;
};

/**
 * Type definition for sphere data state
 */
type SphereDataState = {
  rootOrbitOrbitDetails: OrbitNodeDetails | null;
  winData: WinDataPerOrbitNode;
  calculateOptions: nonLeafCompletionCalculationContext;
};

/**
 * Helper function to convert Map to plain object
 * @param map Map to convert
 * @returns Plain object representation of the map
 */
const mapToObject = (map: Map<string, any>): Record<string, any> => {
  return Array.from(map.entries()).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {} as Record<string, any>);
};

/**
 * ListSpheres Component
 * Displays a list of spheres with their associated orbit hierarchies and win data.
 * Handles data fetching, state management, and navigation.
 */
function ListSpheres() {
  const [_state, transition, _params, client] = useStateTransition();

  /** Loading states for individual spheres */
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const loadingInitiatedRef = useRef(false);

  /** Refs for storing update data during processing */
  const winDataUpdatesRef = useRef<Map<ActionHashB64, any>>(new Map());
  const orbitDataUpdatesRef = useRef<Record<ActionHashB64, any>>({});

  /** Query hooks for fetching data */
  const { loading, error, data } = useGetSpheresQuery();
  const [getHierarchy] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "network-only",
  });

  /** Memoized spheres data from query */
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data]);

  /** State for storing processed sphere data */
  const [spheresData, setSpheresData] = useState<Record<string, SphereDataState>>({});

  /**
   * Loads hierarchy data for a single sphere
   * Fetches and processes orbit hierarchy and win data
   * @param sphere The sphere to load data for
   */
  const loadSphereHierarchyData = useCallback(async (sphere: Sphere) => {
    debugLog('Loading hierarchy data for sphere:', sphere.eH);

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
      const state = store.get(appStateChangeAtom);
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

      const trees = JSON.parse(hierarchyData.getOrbitHierarchy);
      if (!trees) return;

      parsedTrees = parseAndSortTrees(trees);
      const rootOrbitEh = parsedTrees[0].content;
      d3Hierarchy = hierarchy(parsedTrees[0]).sort(byStartTime);

      const nodeHashes: string[] = [];
      const leafNodeHashes: string[] = [];
      const leaves: HierarchyNode<NodeContent>[] = [];

      // Process nodes in batches
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
            leaves.push(node);
          }
        });

        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Process win data in batches
      const today = DateTime.now();

      for (let i = 0; i < leaves.length; i += batchSize) {
        const batch = leaves.slice(i, i + batchSize);

        await Promise.all(batch.map(async node => {
          if (!node.data?.content) return;
          if (!winDataUpdatesRef.current) return;

          const actionHash = store.get(getOrbitIdFromEh(node.data.content));
          const winData = await fetchWinDataForOrbit(client, node.data.content, today);
          if (winData) {
            winDataUpdatesRef.current!.set(actionHash, winData);
          }
        }));

        await new Promise(resolve => setTimeout(resolve, 0));
      }
      // Update app state
      store.set(appStateChangeAtom, {
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
      const winDataObject = mapToObject(winDataUpdatesRef.current);
      const calculateOptions: nonLeafCompletionCalculationContext = {
        useRootFrequency: d3Hierarchy?.height === 0,
        leafDescendants: leaves.length
      };
      debugLog('Setting sphere data:', {
        rootOrbitDetails,
        winData: winDataObject,
        calculateOptions
      });

      // Update component state
      setSpheresData(prev => ({
        ...prev,
        [sphere.eH]: {
          rootOrbitOrbitDetails: rootOrbitDetails,
          winData: winDataObject,
          calculateOptions
        }
      }));

    } catch (error) {
      console.error(`Error loading hierarchy data for sphere ${sphere.eH}:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sphere.eH]: false }));
      // Cleanup after state updates
      setTimeout(() => {
        d3Hierarchy = null;
        parsedTrees = null;
        winDataUpdatesRef.current = new Map();
        orbitDataUpdatesRef.current = {};
      }, 0);
    }
  }, [getHierarchy, client]);

  /** Effect to load data for all spheres */
  useEffect(() => {
    if (!spheres.length || loadingInitiatedRef.current) return;

    loadingInitiatedRef.current = true;

    const processQueue = async () => {
      for (const sphere of spheres) {
        await loadSphereHierarchyData(sphere);

        // Verify data loading
        const state = store.get(appStateChangeAtom);
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

  /** Navigation handlers */
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

  /** Debug effect for state changes */
  useEffect(() => {
    debugLog('Spheres data updated:', spheresData);
  }, [spheresData]);

  if (loading) return <Spinner type="full" />;
  if (error) return <p>Error: {error.message}</p>;
  if (!spheres.length) return <></>;

  return (
    <div className="spheres-list">
      {spheres.map((sphere: Sphere) => {
        const isLoading = loadingStates[sphere.eH];
        const sphereData = spheresData[sphere.eH];

        debugLog('Rendering sphere:', sphere.eH, 'with data:', sphereData);
        // TODO move to main component for meaningful memoisation
        // Calculate aggregated win data for root node
        const rootOrbitWinData = useMemo(() => {
          if (!sphereData?.winData || !sphereData.rootOrbitOrbitDetails) return {};

          const leafWinData = sphereData.winData;
          const rootId = sphereData.rootOrbitOrbitDetails.id;

          // Get all unique dates
          const allDates = new Set<string>();
          Object.entries(leafWinData).forEach(([key, winData]) => {
            if (key !== rootId && winData && typeof winData === 'object') {
              Object.keys(winData).forEach(date => allDates.add(date));
            }
          });

          // Create aggregated win data preserving individual completion states
          return Array.from(allDates).reduce((acc, date) => {
            // Map each leaf node's completion state for this date
            const completionStates = Object.entries(leafWinData)
              .filter(([key]) => key !== rootId)
              .map(([_, winData]) => {
                const dayData = winData?.[date];
                return Array.isArray(dayData)
                  ? dayData.every(Boolean)  // If it's an array, check if all true
                  : !!dayData;              // If it's a single value, convert to boolean
              });

            acc[date] = completionStates;
            return acc;
          }, {} as Record<string, boolean[]>);
        }, [sphereData]);

        return (
          <SystemCalendarCard
            key={sphere.id}
            sphere={sphere}
            loading={isLoading}
            rootOrbitWinData={sphereData?.winData ? { ...rootOrbitWinData, ...sphereData.calculateOptions } : {}}
            rootOrbitOrbitDetails={sphereData?.rootOrbitOrbitDetails ?? null}
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
