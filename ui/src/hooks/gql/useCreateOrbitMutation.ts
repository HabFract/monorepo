import { currentSphereHashesAtom } from "./../../state/sphere";
import {
  CreateOrbitResponsePayload,
  useCreateOrbitMutation as useCreateOrbitMutationGenerated,
} from "../../graphql/generated";
import { appStateAtom } from "../../state/store";
import { useSetAtom } from "jotai";
import { OrbitNodeDetails } from "../../state/types/orbit";
import {
  currentSphereOrbitNodesAtom,
  decodeFrequency,
} from "../../state/orbit";
import { nodeCache, store } from "../../state/jotaiKeyValueStore";
import { currentSphereHasCachedNodesAtom } from "../../state/sphere";
import { SphereHashes, SphereOrbitNodes } from "../../state/types/sphere";
import { ActionHashB64 } from "@holochain/client";
import { client } from "../../graphql/client";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";

export const useCreateOrbitMutation = (opts) => {
  const setAppState = useSetAtom(appStateAtom);

  return useCreateOrbitMutationGenerated({
    ...opts,
    update(_cache, { data }) {
      if (!data?.createOrbit) return;

      const newOrbit: CreateOrbitResponsePayload = data.createOrbit;
      const newOrbitDetails: OrbitNodeDetails = {
        id: newOrbit.id,
        eH: newOrbit.eH,
        name: newOrbit.name,
        scale: newOrbit.scale,
        frequency: decodeFrequency(newOrbit.frequency),
        startTime: newOrbit.metadata!.timeframe.startTime,
        sphereHash: newOrbit.sphereHash,
        endTime: newOrbit.metadata!.timeframe.endTime as number | undefined,
        description: newOrbit.metadata!.description as string | undefined,
        parentEh: newOrbit?.parentHash as string | undefined,
      };

      // To be phased out, all appstate will be stored in localstorage anyway
      if (store.get(currentSphereHasCachedNodesAtom)) {
        let sphere = store.get(currentSphereHashesAtom) as SphereHashes;
        let existingNodes = store.get(currentSphereOrbitNodesAtom);
        let newSphereOrbitNodes: SphereOrbitNodes = {
          ...existingNodes,
          [newOrbit.eH]: newOrbitDetails,
        };
        store.set(
          nodeCache.set,
          sphere.actionHash as ActionHashB64,
          newSphereOrbitNodes
        );
      }

      setAppState((prevState) => {
        const updatedState = { ...prevState };
        // Update orbitNodes
        updatedState.orbitNodes = {
          ...prevState.orbitNodes,
          currentOrbitHash: newOrbit.id,
          byHash: {
            ...prevState.orbitNodes.byHash,
            [newOrbit.id]: newOrbitDetails,
          },
        };

        // Update hierarchies if this is a root orbit
        if (
          !newOrbit.parentHash &&
          typeof updatedState?.spheres?.byHash === "object"
        ) {
          const sphereHash = newOrbit.sphereHash;
          const sphereId = Object.entries(updatedState.spheres.byHash).find(
            ([id, sphere]) => sphere.details.entryHash == sphereHash
          )?.[0];
          if (
            !sphereId ||
            !updatedState.spheres.byHash[sphereId]
              ?.hierarchyRootOrbitEntryHashes
          ) {
            console.warn("This sphere has an incomplete entry in the store");
            return updatedState;
          }

          updatedState.spheres.byHash[
            sphereId
          ].hierarchyRootOrbitEntryHashes.push(newOrbit.eH);

          updatedState.hierarchies.byRootOrbitEntryHash[newOrbit.eH] = {
            rootNode: newOrbit.eH,
            json: "",
            bounds: {
              minBreadth: 0,
              maxBreadth: 0,
              minDepth: 0,
              maxDepth: 0,
            },
            indices: { x: 0, y: 0 },
            currentNode: newOrbit.eH,
            nodeHashes: [newOrbit.eH],
          };
        }

        return updatedState;
      });

      // Invalidate the cache for the getOrbitHierarchy query
      (client as Promise<ApolloClient<NormalizedCacheObject>>).then(
        (client) => {
          const normalizedId = client.cache.identify({
            __typename: "Query",
            id: "ROOT_QUERY",
            fieldName: "getOrbitHierarchy",
            args: {
              params: {
                levelQuery: {
                  sphereHashB64: newOrbit.sphereHash,
                  orbitLevel: 0,
                },
              },
            },
          });
          client.cache.evict({ id: normalizedId });
          client.cache.gc();
        }
      );

      opts?.update && opts.update();
    },
  });
};
