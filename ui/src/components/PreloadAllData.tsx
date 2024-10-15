import "../App.css";
import React, { useCallback, useEffect, useRef } from "react";
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
import { debounce } from "./vis/helpers";
import { useSetAtom } from "jotai";
import { OrbitHashes, OrbitNodeDetails } from "../state";
import { updateAppStateWithOrbit } from "../hooks/gql/utils";
import { sleep } from "./lists/OrbitSubdivisionList";

type PreloadAllDataProps = {
  landingSphereEh?: EntryHashB64;
  landingSphereId?: ActionHashB64;
  // landingPage?: string;
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
  onPreloadComplete
}) => {
  const [_, transition] = useStateTransition(); // Top level state machine and routing
  const preloadCompleted = useRef(false);

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

  // Fall back to the first Sphere as redirect context after effects
  const id = sphereNodes?.[0]?.id;
  const eH = sphereNodes?.[0]?.eH;

  const fetchData = useCallback(
    () => {
      try {
        serializeAsyncActions<any>([
          ...sphereNodes.map(({ id, eH }) => async () => {
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
                // Update app state for each orbit
                setAppState((prevState) => {
                  let updatedState = prevState;
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
                      ...prevState.spheres.byHash,
                      [id]: {
                        details: {
                          entryHash: eH,
                        },
                        hierarchyRootOrbitEntryHashes: orbitHashes.filter(hashes => typeof hashes.parentEh == 'undefined').reduce((acc, hashes) => { !acc.includes(hashes.eH) && acc.push(hashes.eH); return acc }, []),
                      },
                    },
                  };
                  return updatedState;
                });
                sleep(100);

                setCurentSphere({
                  actionHash: landingSphereId || id,
                  entryHash: landingSphereEh || eH,
                });
              }
            } catch (error) {
              console.error(error);
            }
          }),
        ]);
      } catch (error) {
        console.error(error);
      }
    },
    [sphereNodes],
  );
  const debouncedFetchData = debounce(fetchData, 3000);

  useEffect(() => {
    if (!data) return;
    // This means we just don't have any Spheres, so no data to preload!
    if (data && !sphereNodes.length) { 
      if (!preloadCompleted.current && onPreloadComplete) {
        console.log('No data preload was needed...');
        preloadCompleted.current = true;
        onPreloadComplete();
      }
      return;
    }

    debouncedFetchData().then(() => {
      console.log('Preloaded all data for each sphere...');
      if (!preloadCompleted.current && onPreloadComplete) {
        onPreloadComplete();
      } else {
        transition("Vis");  
      }
      preloadCompleted.current = true;
    });
  }, [sphereNodes, onPreloadComplete, data, fetchData, landingSphereEh, landingSphereId]);

  return <Spinner aria-label="Loading!" size="xl" className="full-spinner" />;
};

export default React.memo(PreloadAllData);
