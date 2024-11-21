import "../App.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStateTransition } from "../hooks/useStateTransition";
import {
  GetOrbitsDocument,
  Orbit,
  Sphere,
  useGetSpheresQuery,
} from "../graphql/generated";
import { extractEdges, serializeAsyncActions } from "../graphql/utils";
import { appStateAtom, nodeCache, store } from "../state/store";
import { mapToCacheObject } from "../state/orbit";
import { client } from "../graphql/client";
import { currentSphereHashesAtom } from "../state/sphere";
import { Spinner } from "flowbite-react";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useAtom, useSetAtom } from "jotai";
import { updateAppStateWithOrbit } from "../hooks/gql/utils";
import { sleep } from "./lists/OrbitSubdivisionList";

type PreloadAllDataProps = {
  landingSphereEh?: EntryHashB64;
  landingSphereId?: ActionHashB64;
  landingPage?: string;
  onPreloadComplete?: () => void;
};

/**
 * A component that does a batch fetch and cache of SphereOrbitNodeDetails for all Spheres
 * @param {PreloadAllDataProps} - provides optional context on where to route after the data has been loaded:
 *  - Current sphereHashes are set to the provided context eH & iD or else the first sphere in the response from the getSpheres query
 * 
 *  - If onPreloadComplete handler is passed then we call that after all effects have been run
 *  - Else no onPreloadComplete handler is passed so we default to routing to the Vis page
 *    -- with the provided landingSphereEh, landingSphereId context
 */
const PreloadAllData: React.FC<PreloadAllDataProps> = ({
  landingSphereEh,
  landingSphereId,
  landingPage,
  onPreloadComplete
}) => {
  const [_, transition] = useStateTransition(); // Top level state machine and routing
  const [preloadCompleted, setPreloadCompleted] = useState(false);

  const setAppState = useSetAtom(appStateAtom);
  const setNodeCache = useSetAtom(nodeCache.set);
  const setCurentSphere = useSetAtom(currentSphereHashesAtom);
  // Fetch spheres (which are the beginning of any graph of data in the app)
  const {
    loading: loadingSpheres,
    error,
    data,
  } = useGetSpheresQuery();

  const sphereNodes = data ? extractEdges(data.spheres) as Sphere[] : [];

  const fetchData = useCallback(
    () => {
      try {
        serializeAsyncActions<any>([
          ...sphereNodes.map(({ id, eH, name }) => async () => {
            const variables = { sphereEntryHashB64: eH };
            let data;
            try {
              const gql = await client;
              data =
                gql &&
                (await gql.query({
                  query: GetOrbitsDocument,
                  variables,
                  fetchPolicy: "network-only",
                }));
              if (data?.data?.orbits) {
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
                let updatedState = store.get(appStateAtom);
                // Update app state for each orbit
                orbitHashes.sort((hashesA, hashesB) => {
                  // Process the root hash last which will set it as current Orbit
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
                      ...updatedState.spheres.byHash[id], // Preserve existing sphere data
                      details: {
                        ...updatedState.spheres.byHash[id]?.details, // Preserve existing details
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
                setAppState(updatedState);
                setCurentSphere({
                  actionHash: landingSphereId || id,
                  entryHash: landingSphereEh || eH,
                });
                console.log('updatedState preload', updatedState)
              }
              
              await sleep(250);
            } catch (error) {
              console.error(error);
              return Promise.reject()
            }
          }),
          async () => {
            await sleep(500);
            await setPreloadCompleted(true);
            // return Promise.resolve(
            //   console.log(
            //     "Current cache: :>> ",
            //     store.get(nodeCache.entries),
            //   ),
            // )
          },
        ]);
      } catch (error) {
        console.error(error);
        return Promise.reject()
      }
      return Promise.resolve(sleep(200))
    },
    [sphereNodes],
  );

  useEffect(() => {
    if (!data) return;
    // This means we just don't have any Spheres, so no data to preload!
    if (data && !sphereNodes.length) {
      if (!preloadCompleted && onPreloadComplete) {
        console.log('No data preload was needed...');

        setPreloadCompleted(true);
        onPreloadComplete();
      }
      return;
    }
    fetchData();
  }, [sphereNodes, onPreloadComplete, data, fetchData, landingSphereEh, landingSphereId]);

  useEffect(() => {
    if (!preloadCompleted) return;
    console.log('preloadCompleted :>> ', preloadCompleted);

    if (onPreloadComplete) {
      onPreloadComplete();
    } else {
      console.log('routing to landingpage :>> ');
      transition(landingPage || "Vis", {currentSphereDetails: { ...sphereNodes[0] }});
    }
  }, [preloadCompleted]);

  return <Spinner aria-label="Loading!" size="xl" className="full-spinner" />;
};

export default React.memo(PreloadAllData);
