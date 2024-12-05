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
  nodeCache, 
  OrbitNodeDetails, 
  SphereEntry, 
  store, 
  WinDataPerOrbitNode 
} from "../../state";
import { useSetAtom } from "jotai";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppMachine } from "../../main";
import { calculateWinDataForNonLeafNodeAtom } from "../../state/win";
import { DataLoadingQueue } from "../PreloadAllData";
import { updateHierarchyAtom } from "../../state/hierarchy";
import { sleep } from "./OrbitSubdivisionList";
import { byStartTime, parseAndSortTrees } from "../vis/helpers";
import { hierarchy } from "d3-hierarchy";
import { VisCoverage } from "../vis/types";
import { generateQueryParams } from "../vis/tree-helpers";

/**
 * ListSpheres Component
 * Displays a list of spheres with their hierarchy and win data
 */
function ListSpheres() {
  // State management
  const [_state, transition] = useStateTransition();
  const setHierarchyInAppState = useSetAtom(updateHierarchyAtom);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const loadingInitiatedRef = useRef(false);

  // GraphQL queries
  const { loading, error, data } = useGetSpheresQuery();
  const [getHierarchy] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "cache-first",
  });

  // Derived data
  const spheres = useMemo(() => extractEdges(data!.spheres) as Sphere[], [data]);
  const dataLoadingQueue = useMemo(() => new DataLoadingQueue(), []);

  // Sphere data state
  const [spheresData, setSpheresData] = useState<Record<string, {
    rootOrbitOrbitDetails: OrbitNodeDetails | null,
    rootOrbitWinData: WinDataPerOrbitNode | null
  }>>({});

  /**
   * Loads hierarchy data for a single sphere and updates app state
   * @param sphere - The sphere to load hierarchy data for
   */
  const loadSphereHierarchyData = useCallback(async (sphere: Sphere) => {
    // console.log('Starting hierarchy load for sphere:', {
    //   sphereEh: sphere.eH,
    //   sphereId: sphere.id
    // });
    
    setLoadingStates(prev => ({ ...prev, [sphere.eH]: true }));

    try {
      const state = store.get(appStateAtom);
      let sphereEntry = Object.values(state.spheres.byHash).find(
        (s: any) => s?.details?.entryHash === sphere.eH
      );

      // If sphere entry doesn't exist, create it
      if (!sphereEntry) {
        // console.log('Creating sphere entry for:', sphere.eH);
        
        // Update app state with new sphere entry
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
        
        // Get updated sphere entry
        sphereEntry = newState.spheres.byHash[sphere.id];
        // console.log('Created sphere entry:', sphereEntry);
      }

      // Fetch hierarchy data
      const visCoverage = VisCoverage.CompleteSphere;
      const getQueryParams = generateQueryParams(visCoverage, sphere.eH);
      const queryParams = getQueryParams(0);

      // console.log('Query params:', queryParams);

      if (!queryParams) {
        console.warn('Failed to generate query params for sphere:', sphere.eH);
        return;
      }

      const { data: hierarchyData } = await getHierarchy({ 
        variables: { params: queryParams } 
      });

      // console.log('Received hierarchy data:', hierarchyData);

      if (hierarchyData?.getOrbitHierarchy) {
        const trees = JSON.parse(hierarchyData.getOrbitHierarchy);
        // console.log('Parsed hierarchy trees:', trees);
        
        if (!trees) {
          console.warn('Failed to parse hierarchy trees for sphere:', sphere.eH);
          return;
        }

        const parsedTrees = parseAndSortTrees(trees);
        // console.log('Sorted trees:', parsedTrees);
        
        const json = JSON.stringify(parsedTrees[0]); // Use first tree
        const d3Hierarchy = hierarchy(JSON.parse(json)).sort(byStartTime);
        // console.log('D3 Hierarchy created:', d3Hierarchy);

        // Get root orbit EH from the first tree
        const rootOrbitEh = parsedTrees[0].content;
        // console.log('Root orbit EH from hierarchy:', rootOrbitEh);

        // Update sphere entry with root orbit EH
        const updatedState = {
          ...store.get(appStateAtom),
          spheres: {
            ...state.spheres,
            byHash: {
              ...state.spheres.byHash,
              [sphere.id]: {
                ...state.spheres.byHash[sphere.id],
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
          // console.log('Processing node:', node);
          if (!node.data) {
            console.warn('Node missing data:', node);
            return;
          }
          if (!node.data.content) {
            console.warn('Node missing content:', {
              node,
              data: node.data
            });
            return;
          }
          nodeHashes.push(node.data.content);
          if (!node.children || node.children.length === 0) {
            leafNodeHashes.push(node.data.content);
          }
        });

        // console.log('Extracted hashes:', {
        //   nodeHashesCount: nodeHashes.length,
        //   nodeHashes,
        //   leafNodeHashesCount: leafNodeHashes.length,
        //   leafNodeHashes,
        //   rootOrbitEh
        // });

        // Create hierarchy object
        const fullHierarchy = {
          rootNode: rootOrbitEh,
          json,
          nodeHashes,
          leafNodeHashes,
          bounds: undefined,
          indices: { x: 0, y: 0 },
          currentNode: rootOrbitEh
        };

        // Update app state with hierarchy
        store.set(appStateAtom, {
          ...updatedState,
          hierarchies: {
            ...updatedState.hierarchies,
            byRootOrbitEntryHash: {
              ...updatedState.hierarchies.byRootOrbitEntryHash,
              [rootOrbitEh]: fullHierarchy
            }
          }
        });

        // Update local component state
        setSpheresData(prev => ({
          ...prev,
          [sphere.eH]: {
            rootOrbitOrbitDetails: store.get(nodeCache.entries)[rootOrbitEh] || null,
            rootOrbitWinData: store.get(calculateWinDataForNonLeafNodeAtom(rootOrbitEh))
          }
        }));
      }

      await sleep(250);
    } catch (error) {
      console.error(`Error loading hierarchy data for sphere ${sphere.eH}:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sphere.eH]: false }));
    }
  }, [getHierarchy]);

  /**
   * Initialize sphere data and queue hierarchy loading
   */
  useEffect(() => {
    if (!spheres.length || loadingInitiatedRef.current) return;

    const loadSphereData = async () => {
      loadingInitiatedRef.current = true;
      
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

      // Queue hierarchy loading for each sphere
      spheres.forEach(sphere => {
        dataLoadingQueue.enqueue(async () => {
          await loadSphereHierarchyData(sphere);
        });
      });
    };

    loadSphereData();

    return () => {
      loadingInitiatedRef.current = false;
    };
  }, [spheres, loadSphereHierarchyData, dataLoadingQueue]);

  /**
   * Navigation handlers
   */
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
        const sphereData = spheresData[sphere.eH] || {
          rootOrbitOrbitDetails: null,
          rootOrbitWinData: null
        };
        const isLoading = loadingStates[sphere.eH];
console.log('sphereData :>> ', sphereData);
        return (
          <SystemCalendarCard
            key={sphere.id}
            sphere={sphere}
            loading={isLoading}
            rootOrbitWinData={sphereData.rootOrbitWinData}
            rootOrbitOrbitDetails={sphereData.rootOrbitOrbitDetails}
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