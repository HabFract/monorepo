import { AppState } from "../../state/types/store";
import {
  Hierarchy,
  nodeCache,
  OrbitHashes,
  OrbitNodeDetails,
  SphereEntry,
  store,
} from "../../state";
import {
  currentSphereHashesAtom,
  currentSphereHasCachedNodesAtom,
} from "../../state/sphere";
import { SphereHashes, SphereOrbitNodeDetails } from "../../state/types/sphere";
import { ActionHashB64 } from "@holochain/client";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { client } from "../../graphql/client";

export const invalidateOrbitHierarchyCache = (sphereHashB64: string) => {
  (client as Promise<ApolloClient<NormalizedCacheObject>>).then((client) => {
    const normalizedId = client.cache.identify({
      __typename: "Query",
      id: "ROOT_QUERY",
      fieldName: "getOrbitHierarchy",
      args: {
        params: {
          levelQuery: {
            sphereHashB64,
            orbitLevel: 0,
          },
        },
      },
    });
    client.cache.evict({ id: normalizedId });
    client.cache.gc();
  });
};

export const updateNodeCache = (orbitDetails: OrbitNodeDetails) => {
  if (store.get(currentSphereHasCachedNodesAtom)) {
    const sphere = store.get(currentSphereHashesAtom) as SphereHashes;
    const existingNodes = store.get(
      nodeCache.item(sphere.actionHash as string)
    ) as SphereOrbitNodeDetails;

    const newSphereOrbitNodeDetails: SphereOrbitNodeDetails = {
      ...existingNodes,
      [orbitDetails.eH]: orbitDetails,
    };
    store.set(
      nodeCache.set,
      sphere.actionHash as ActionHashB64,
      newSphereOrbitNodeDetails
    );
  }
};

export const updateAppStateWithOrbit = (
  prevState: AppState,
  orbitDetails: OrbitHashes,
  isNewOrbit: boolean
): AppState => {
  const updatedState = { ...prevState };

  // Update orbitNodes
  updatedState.orbitNodes = {
    ...prevState.orbitNodes,
    currentOrbitHash: orbitDetails.id,
    byHash: {
      ...prevState.orbitNodes.byHash,
      [orbitDetails.id]: orbitDetails as OrbitHashes,
    },
  };

  // Update hierarchies if this is a root orbit
  if (!orbitDetails.parentEh) {
    const sphereHash = orbitDetails.sphereHash;
    const sphereId = Object.entries(updatedState.spheres.byHash).find(
      ([id, sphere]) => (sphere as SphereEntry).details.entryHash === sphereHash
    )?.[0];

    if (
      sphereId &&
      updatedState.spheres.byHash[sphereId]?.hierarchyRootOrbitEntryHashes
    ) {
      if (isNewOrbit) {
        updatedState.spheres.byHash[
          sphereId
        ].hierarchyRootOrbitEntryHashes.push(orbitDetails.eH);
      }

      const newHierarchy: Hierarchy = {
        rootNode: orbitDetails.eH,
        json: "",
        bounds: {
          minBreadth: 0,
          maxBreadth: 0,
          minDepth: 0,
          maxDepth: 0,
        },
        indices: { x: 0, y: 0 },
        currentNode: orbitDetails.eH,
        nodeHashes: [orbitDetails.eH],
      };

      updatedState.hierarchies.byRootOrbitEntryHash[orbitDetails.eH] =
        newHierarchy;
    }
  }

  return updatedState;
};
