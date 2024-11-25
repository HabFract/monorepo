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
import { updateAppStateWithOrbit } from "../hooks/gql/utils";
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

  /**
   * Process the queue of tasks
   */
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

  const [appState, setAppState] = useAtom(appStateAtom);
  const setNodeCache = useSetAtom(nodeCache.set);
  const setCurentSphere = useSetAtom(currentSphereHashesAtom);

  const {
    loading: loadingSpheres,
    error,
    data,
  } = useGetSpheresQuery({
    fetchPolicy: 'network-only',
  });

  const sphereNodes = useMemo(() => data ? extractEdges(data.spheres) as Sphere[] : [], [data]);

  const dataLoadingQueue = useMemo(() => new DataLoadingQueue(), []);

  const fetchDataRef = useRef(false);
  const prevAppStateRef = useRef(appState);

  /**
   * Fetch data for all spheres
   */
  const fetchData = useCallback(
    async () => {
      if (fetchDataRef.current) return;
      fetchDataRef.current = true;

      log('fetchData started', { sphereNodes });

      if (sphereNodes.length === 0) {
        log('No spheres to fetch data for');
        setPreloadCompleted(true);
        return;
      }
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
              log(`Received orbits data for sphere: ${name}`, data.data.orbits);
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
              log(`Updating state for sphere: ${name}`, { prevState });
              let updatedState = { ...prevState };
              orbitHashes.sort((hashesA, hashesB) => {
                return +((!!hashesB?.parentEh)) - (+(!!hashesA?.parentEh))
              }).forEach(orbitHashes => {
                updatedState = updateAppStateWithOrbit(updatedState, orbitHashes, true);
              });

              updatedState.spheres = {
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
              };
              log(`Updated state for sphere: ${name}`, { updatedState });
              setAppState(updatedState);
              
              setCurentSphere(landingSphereId || id);
              log(`Finished processing sphere: ${name}`);
            }

            await sleep(250);
          });
        }

        await dataLoadingQueue.enqueue(async () => {
          log('Before final sleep');
          await sleep(500);
          log('After final sleep, before setting preloadCompleted');
          const finalState = store.get(appStateAtom);
          log('Final state before setting preloadCompleted:', finalState);
          setPreloadCompleted(true);
          log('After setting preloadCompleted');
        });
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        log('fetchData completed');
        fetchDataRef.current = false;
      }
    },
    [sphereNodes, dataLoadingQueue, setAppState, setNodeCache, setCurentSphere, landingSphereEh, landingSphereId],
  );

  useEffect(() => {
    log('Data:', data);
    log('Sphere nodes:', sphereNodes);
    if (loadingSpheres) {
      log('Loading spheres...');
      return;
    }
    if (error) {
      console.error('Error loading spheres:', error);
      setPreloadCompleted(true);
      return;
    }
    if (!data || sphereNodes.length === 0) {
      log('No spheres available');
      setPreloadCompleted(true);
      return;
    }
    if (!fetchDataRef.current) {
      log('Starting fetchData');
      fetchData();
    }
  }, [data, sphereNodes, loadingSpheres, error, fetchData]);

  useEffect(() => {
    log('useEffect triggered', { preloadCompleted, transitionInitiatedRef: transitionInitiatedRef.current });
    if (!preloadCompleted || transitionInitiatedRef.current) return;
    log('preloadCompleted :>> ', preloadCompleted);

    if (onPreloadComplete) {
      log('Calling onPreloadComplete');
      onPreloadComplete();
    } else {
      log('Routing to landing page');
      transitionInitiatedRef.current = true;
      dataLoadingQueue.enqueue(async () => {
        log('Before transitioning');
        const finalState = store.get(appStateAtom);
        log('Final state before transition:', finalState);
        log('Transitioning to:', landingPage || "Vis");
        transition(landingPage || "Vis", { currentSphereDetails: sphereNodes[0] || undefined });
        log('After transitioning');
      });
    }
  }, [preloadCompleted, dataLoadingQueue, transition, landingPage, sphereNodes, onPreloadComplete]);

  useEffect(() => {
    const currentAppState = store.get(appStateAtom);
    log('AppState changed:', { 
      prev: prevAppStateRef.current, 
      current: currentAppState 
    });
    prevAppStateRef.current = currentAppState;
  }, [appState]);

  useEffect(() => {
    const unsubscribe = store.sub(appStateAtom, () => {
      const currentState = store.get(appStateAtom);
      log('AppState changed outside component:', currentState);
    });

    return () => unsubscribe();
  }, []);

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

export default React.memo(PreloadAllData, (prevProps, nextProps) => {
  log('PreloadAllData memo check', { prevProps, nextProps });
  return prevProps.landingSphereEh === nextProps.landingSphereEh &&
    prevProps.landingSphereId === nextProps.landingSphereId &&
    prevProps.landingPage === nextProps.landingPage &&
    prevProps.onPreloadComplete === nextProps.onPreloadComplete;
});