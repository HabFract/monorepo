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
import { nodeCache, store } from "../state/store";
import { mapToCacheObject } from "../state/orbit";
import { client } from "../graphql/client";
import { currentSphereHashesAtom } from "../state/sphere";
import { Spinner } from "flowbite-react";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { debounce } from "./vis/helpers";

type PreloadAllDataProps = {
  landingSphereEh?: EntryHashB64;
  landingSphereId?: ActionHashB64;
  landingPage?: string;
  onPreloadComplete?: () => void;
};

/**
 * A component that does a batch fetch and cache of SphereOrbitNodeDetails for all Spheres
 * @param {PreloadAllDataProps} - provides optional context on where to route after the data has been loaded 
 * 
 */
const PreloadAllData: React.FC<PreloadAllDataProps> = ({
  landingSphereEh,
  landingSphereId,
  landingPage,
  onPreloadComplete
}) => {
  const [_, transition] = useStateTransition(); // Top level state machine and routing
  const preloadCompleted = useRef(false);

  // Fetch spheres (which are the beginning of any graph of data in the app)
  const {
    loading: loadingSpheres,
    error,
    data,
  } = useGetSpheresQuery();

  const sphereNodes = data ? extractEdges(data.spheres) as Sphere[] : [];

  const fetchData = useCallback(
    async (id: ActionHashB64, eH: EntryHashB64) => {
      try {
        await serializeAsyncActions<any>([
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
                const indexedOrbitData = Object.entries(
                  orbits.map(mapToCacheObject),
                ).map(([_idx, value]) => [value.eH, value]);
                store.set(
                  nodeCache.set,
                  id,
                  Object.fromEntries(indexedOrbitData),
                );
              }
            } catch (error) {
              console.error(error);
            }
          }),
          async () =>
            Promise.resolve(
              console.log(
                "Preloaded and cached! :>> ",
                store.get(nodeCache.items),
              ),
            ),
          async () => {
            transition(landingPage || "Vis", {
              currentSphereEhB64: eH,
              currentSphereAhB64: id,
            })
          },
        ]);
      } catch (error) {
        console.error(error);
      }
    },
    [sphereNodes],
  );
  const debouncedFetchData = useCallback(
    debounce(fetchData, 3000),
    [fetchData]
  );

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

    // Use either first returned Sphere as the landing vis (this will always work for Onboarding) or a passed in parameter
    const { id, eH } = sphereNodes[0];
    const landingId = landingSphereId || id;
    const landingEh = landingSphereEh || eH;

    store.set(currentSphereHashesAtom, {
      actionHash: landingId,
      entryHash: landingEh,
    });

    debouncedFetchData(landingId, landingEh).then(() => {
      console.log('Preloaded all data for each sphere...');
      if (!preloadCompleted.current && onPreloadComplete) {
        preloadCompleted.current = true;
        onPreloadComplete();
      }
    });
  }, [sphereNodes, onPreloadComplete, data, fetchData, landingSphereEh, landingSphereId, landingPage]);

  return <Spinner aria-label="Loading!" size="xl" className="full-spinner" />;
};

export default React.memo(PreloadAllData);
