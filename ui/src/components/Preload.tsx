import React, { useCallback, useEffect } from "react";
import { useStateTransition } from "../hooks/useStateTransition";
import {
  GetOrbitsDocument,
  Orbit,
  Sphere,
  useGetSpheresQuery,
} from "../graphql/generated";
import { extractEdges, serializeAsyncActions } from "../graphql/utils";
import { nodeCache, store } from "../state/jotaiKeyValueStore";
import { mapToCacheObject } from "../state/orbit";
import { client } from "../graphql/client";
import { currentSphereHashesAtom } from "../state/sphere";
import { Spinner } from "flowbite-react";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";

type PreloadOrbitDataProps = {
  landingSphereEh?: EntryHashB64;
  landingSphereId?: ActionHashB64;
};

const PreloadOrbitData: React.FC<PreloadOrbitDataProps> = ({
  landingSphereEh,
  landingSphereId,
}) => {
  const [_, transition] = useStateTransition(); // Top level state machine and routing

  const {
    loading: loadingSpheres,
    error,
    data: spheres,
  } = useGetSpheresQuery();

  const sphereNodes = extractEdges(spheres!.spheres) as Sphere[];

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
                console.log("ALL Sphere orbits fetched and cached!");
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
          async () =>
            transition("Vis", {
              currentSphereEhB64: eH,
              currentSphereAhB64: id,
            }),
        ]);
      } catch (error) {
        console.error(error);
      }
    },
    [sphereNodes],
  );

  useEffect(() => {
    if (!sphereNodes.length) return;
    if (!sphereNodes.length) return;

    // Use either first returned Sphere as the landing vis (this will always work for Onboarding) or a passed in parameter
    const { id, eH } = sphereNodes[0];
    const landingId = landingSphereId || id;
    const landingEh = landingSphereEh || eH;

    store.set(currentSphereHashesAtom, {
      actionHash: landingId,
      entryHash: landingEh,
    });

    fetchData(landingId, landingEh);
  }, [sphereNodes]);

  return <Spinner aria-label="Loading!" size="xl" className="full-spinner" />;
};

export default PreloadOrbitData;
