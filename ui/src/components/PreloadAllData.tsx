import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useStateTransition } from "../hooks/useStateTransition";
import {
  GetOrbitsDocument,
  Orbit,
  Sphere,
  useGetSpheresQuery,
} from "../graphql/generated";
import { extractEdges } from "../graphql/utils";
import { appStateAtom, nodeCache, store } from "../state/store";
import { mapToCacheObject } from "../state/orbit";
import { client } from "../graphql/client";
import { currentSphereHashesAtom } from "../state/sphere";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useAtom, useSetAtom } from "jotai";
import { sleep } from "./lists/OrbitSubdivisionList";
import { Spinner } from "habit-fract-design-system";

/** Flag to enable/disable verbose logging */
const VERBOSE_LOGGING = false;

/**
 * Conditional logging function
 * @param {string} message - The message to log
 * @param {any} [data] - Optional data to log
 */
const log = (message: string, data?: any) => {
  if (VERBOSE_LOGGING) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

interface PreloadAllDataProps {
  landingSphereEh?: EntryHashB64;
  landingSphereId?: ActionHashB64;
  landingPage?: string;
  onPreloadComplete?: () => void;
}

/**
 * DataLoadingQueue class for managing asynchronous tasks
 */
export class DataLoadingQueue {
  private queue: { id: number; task: () => Promise<void> }[] = [];
  private isProcessing: boolean = false;
  private taskId = 0;

  /**
   * Enqueue a new task
   * @param {() => Promise<void>} task - The task to enqueue
   * @returns {Promise<void>}
   */
  enqueue(task: () => Promise<void>) {
    const id = this.taskId++;
    log(`Enqueueing task ${id}`);
    return new Promise<void>((resolve, reject) => {
      this.queue.push({
        id,
        task: async () => {
          try {
            log(`Starting task ${id}`);
            await task();
            log(`Completed task ${id}`);
            resolve();
          } catch (error) {
            console.error(`Error in task ${id}:`, error);
            reject(error);
          }
        }
      });
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    log('Start processing queue', { queueLength: this.queue.length });
    while (this.queue.length > 0) {
      const { id, task } = this.queue.shift()!;
      log(`Executing task ${id}`);
      await task();
      log(`Task ${id} completed`);
    }

    log('Queue processing completed');
    this.isProcessing = false;
  }
}

/**
 * PreloadAllData component for preloading and managing application state
 * @param {PreloadAllDataProps} props - Component props
 */
const PreloadAllData: React.FC<PreloadAllDataProps> = ({
  landingSphereEh,
  landingSphereId,
  landingPage,
  onPreloadComplete
}) => {
  const [_, transition] = useStateTransition();
  const [preloadCompleted, setPreloadCompleted] = useState(false);
  const transitionInitiatedRef = useRef(false);
  const initialStateRef = useRef<any>(null);

  const [__, setAppState] = useAtom(appStateAtom);
  const setNodeCache = useSetAtom(nodeCache.set);
  const setCurentSphere = useSetAtom(currentSphereHashesAtom);

  const {
    loading: loadingSpheres,
    error,
    data,
  } = useGetSpheresQuery({
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false,
  });

  const sphereNodes = useMemo(() => data ? extractEdges(data.spheres) as Sphere[] : [], [data]);
  const dataLoadingQueue = useMemo(() => new DataLoadingQueue(), []);
  const fetchDataRef = useRef(false);

  const verifyAndRestoreState = useCallback(() => {
    if (!initialStateRef.current) return;
    
    const currentState = store.get(appStateAtom);
    const currentOrbitCount = Object.keys(currentState.orbitNodes.byHash).length;
    const initialOrbitCount = Object.keys(initialStateRef.current.orbitNodes.byHash).length;
    
    if (currentOrbitCount < initialOrbitCount) {
      log('State reset detected, restoring state', {
        currentCount: currentOrbitCount,
        initialCount: initialOrbitCount
      });
      store.set(appStateAtom, initialStateRef.current);
      return true;
    }
    return false;
  }, []);

  const fetchData = useCallback(
    async () => {
      if (fetchDataRef.current) return;
      fetchDataRef.current = true;

      log('fetchData started', { sphereNodes });
      
      // Save initial state after first sphere is processed
      const saveInitialState = (state: any) => {
        if (!initialStateRef.current) {
          initialStateRef.current = JSON.parse(JSON.stringify(state));
          log('Initial state saved', initialStateRef.current);
        }
      };

      try {
        for (const { id, eH, name } of sphereNodes) {
          await dataLoadingQueue.enqueue(async () => {
            log(`Starting to fetch data for sphere: ${name}`);
            const variables = { sphereEntryHashB64: eH };
            const gql = await client;
            const data = gql && (await gql.query({
              query: GetOrbitsDocument,
              variables,
              fetchPolicy: "network-only",
            }));

            if (data && data?.data?.orbits) {
              const orbits = extractEdges(data.data.orbits) as Orbit[];
              const indexedOrbitNodeDetails = Object.entries(
                orbits.map(mapToCacheObject),
              ).map(([_idx, value]) => [value.eH, value]);

              const orbitHashes = Object.entries(
                orbits.map(mapToCacheObject),
              ).map(([_idx, value]) => ({
                id: value.id,
                eH: value.eH,
                sphereHash: value.sphereHash,
                childEh: value?.childEh,
                parentEh: value?.parentEh,
              }));

              setNodeCache(
                id,
                Object.fromEntries(indexedOrbitNodeDetails),
              );
              
              const prevState = store.get(appStateAtom);
              let updatedState = { ...prevState };
              
              // Create a map of all orbit nodes
              const orbitNodesMap = { ...prevState.orbitNodes.byHash };
              
              // Update the map with new orbits
              orbitHashes.forEach(orbitHash => {
                orbitNodesMap[orbitHash.id] = {
                  id: orbitHash.id,
                  eH: orbitHash.eH,
                  sphereHash: orbitHash.sphereHash,
                  childEh: orbitHash.childEh,
                  parentEh: orbitHash.parentEh,
                };
              });

              // Update state with preserved orbit nodes
              updatedState = {
                ...updatedState,
                orbitNodes: {
                  ...updatedState.orbitNodes,
                  byHash: orbitNodesMap,
                  currentOrbitHash: orbitHashes[0]?.eH || updatedState.orbitNodes.currentOrbitHash,
                },
                spheres: {
                  ...updatedState.spheres,
                  currentSphereHash: id,
                  byHash: {
                    ...updatedState.spheres.byHash,
                    [id]: {
                      ...updatedState.spheres.byHash[id],
                      details: {
                        ...updatedState.spheres.byHash[id]?.details,
                        entryHash: eH,
                        name: name
                      },
                      hierarchyRootOrbitEntryHashes: orbitHashes
                        .filter(hashes => typeof hashes.parentEh == 'undefined')
                        .reduce((acc, hashes) => {
                          !acc.includes(hashes.eH) && acc.push(hashes.eH);
                          return acc
                        }, [] as any),
                    },
                  },
                }
              };

              log(`Updated state for sphere: ${name}`, { 
                updatedState,
                orbitNodesCount: Object.keys(updatedState.orbitNodes.byHash).length 
              });
              
              setAppState(updatedState);
              saveInitialState(updatedState);
              
              setCurentSphere(landingSphereId || id);
              log(`Finished processing sphere: ${name}`);
              
              // Verify state wasn't reset
              verifyAndRestoreState();
            }

            await sleep(250);
          });
        }

        await dataLoadingQueue.enqueue(async () => {
          log('Final task - Starting');
          
          // Verify state one last time before completing
          verifyAndRestoreState();
          
          const finalState = store.get(appStateAtom);
          log('Final state before completing:', {
            orbitNodesCount: Object.keys(finalState.orbitNodes.byHash).length,
            state: finalState
          });
          
          setPreloadCompleted(true);
        });
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        log('fetchData completed');
        fetchDataRef.current = false;
      }
    },
    [sphereNodes, dataLoadingQueue, setAppState, setNodeCache, setCurentSphere, landingSphereId, verifyAndRestoreState],
  );

  useEffect(() => {
    log('[Effect 1 - Data Loading]', {
      loading: loadingSpheres,
      error,
      data,
      fetchDataRef: fetchDataRef.current
    });
    
    if (loadingSpheres) return;
    if (error) {
      console.error('Error loading spheres:', error);
      setPreloadCompleted(true);
      return;
    }
    if (!data || sphereNodes.length === 0) {
      setPreloadCompleted(true);
      return;
    }
    if (!fetchDataRef.current) {
      fetchData();
    }
  }, [data, sphereNodes, loadingSpheres, error, fetchData]);

  useEffect(() => {
    log('[Effect 2 - Preload Complete]', {
      preloadCompleted,
      transitionInitiated: transitionInitiatedRef.current
    });
    
    if (!preloadCompleted || transitionInitiatedRef.current) return;

    if (onPreloadComplete) {
      onPreloadComplete();
    } else {
      transitionInitiatedRef.current = true;
      dataLoadingQueue.enqueue(async () => {
        verifyAndRestoreState();
        transition(landingPage || "Vis", { currentSphereDetails: sphereNodes[0] || undefined });
      });
    }
  }, [preloadCompleted, dataLoadingQueue, transition, landingPage, sphereNodes, onPreloadComplete, verifyAndRestoreState]);

  if (loadingSpheres) {
    return <Spinner aria-label="Loading spheres!" />;
  }

  if (error) {
    return <div>Error loading data. Please try again.</div>;
  }

  if (!data || sphereNodes.length === 0) {
    return <div>No spheres available. Please create a sphere first.</div>;
  }

  return <Spinner aria-label="Loading!" />;
};

export default React.memo(PreloadAllData);