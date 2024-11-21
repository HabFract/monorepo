import React, { useCallback, useEffect, useState, useMemo } from "react";
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

interface PreloadAllDataProps {
  landingSphereEh?: EntryHashB64;
  landingSphereId?: ActionHashB64;
  landingPage?: string;
  onPreloadComplete?: () => void;
}

export class DataLoadingQueue {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing: boolean = false;

  enqueue(task: () => Promise<void>) {
    return new Promise<void>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await task();
          resolve();
        } catch (error) {
          reject(error);
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

    console.log('Start processing queue');
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        console.log('Executing task');
        await task();
        console.log('Task completed');
      }
    }

    console.log('Queue processing completed');
    this.isProcessing = false;
  }
}

const PreloadAllData: React.FC<PreloadAllDataProps> = ({
  landingSphereEh,
  landingSphereId,
  landingPage,
  onPreloadComplete
}) => {
  const [_, transition] = useStateTransition();
  const [preloadCompleted, setPreloadCompleted] = useState(false);

  const setAppState = useSetAtom(appStateAtom);
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

  const fetchData = useCallback(
    async () => {
      if (sphereNodes.length === 0) {
        console.log('No spheres to fetch data for');
        setPreloadCompleted(true);
        return;
      }
      try {
        for (const { id, eH, name } of sphereNodes) {
          await dataLoadingQueue.enqueue(async () => {
            console.log(`Fetching data for sphere: ${name}`);
            const variables = { sphereEntryHashB64: eH };
            const gql = await client;
            const data = gql && (await gql.query({
              query: GetOrbitsDocument,
              variables,
              fetchPolicy: "network-only",
            }));

            if (data?.data?.orbits) {
              console.log(`Received orbits data for sphere: ${name}`, data.data.orbits);
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
              setAppState((prevState) => {
                console.log('Previous app state:', prevState);
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
                console.log('New app state:', updatedState);
                return updatedState;
              });
              setCurentSphere({
                actionHash: landingSphereId || id,
                entryHash: landingSphereEh || eH,
              });
              console.log(`Updated app state for sphere: ${name}`);
            }

            await sleep(250);
          });
        }

        await dataLoadingQueue.enqueue(async () => {
          await sleep(500);
          console.log('All data loaded, setting preloadCompleted');
          setPreloadCompleted(true);
        });
      } catch (error) {
        console.error("Error in fetchData:", error);
        setPreloadCompleted(true);
      }
    },
    [sphereNodes, dataLoadingQueue, setAppState, setNodeCache, setCurentSphere, landingSphereEh, landingSphereId],
  );

  useEffect(() => {
    console.log('Data:', data);
    console.log('Sphere nodes:', sphereNodes);
    if (loadingSpheres) {
      console.log('Loading spheres...');
      return;
    }
    if (error) {
      console.error('Error loading spheres:', error);
      setPreloadCompleted(true);
      return;
    }
    if (!data || sphereNodes.length === 0) {
      console.log('No spheres available');
      setPreloadCompleted(true);
      return;
    }
    console.log('Starting fetchData');
    fetchData();
  }, [data, sphereNodes, loadingSpheres, error, fetchData]);

  useEffect(() => {
    if (!preloadCompleted) return;
    console.log('preloadCompleted :>> ', preloadCompleted);

    if (onPreloadComplete) {
      console.log('Calling onPreloadComplete');
      onPreloadComplete();
    } else {
      console.log('Routing to landing page');
      dataLoadingQueue.enqueue(async () => {
        console.log('Transitioning to:', landingPage || "Vis");
        transition(landingPage || "Vis", { currentSphereDetails: sphereNodes[0] || undefined });
      });
    }
  }, [preloadCompleted, dataLoadingQueue, transition, landingPage, sphereNodes, onPreloadComplete]);

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
