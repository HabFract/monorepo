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
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
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

export const updateNodeCache = (
  orbitDetails: OrbitNodeDetails,
  oldOrbitEh?: EntryHashB64
) => {
  if (store.get(currentSphereHasCachedNodesAtom)) {
    const sphere = store.get(currentSphereHashesAtom) as SphereHashes;
    const existingNodes = store.get(
      nodeCache.item(sphere.actionHash as string)
    ) as SphereOrbitNodeDetails;

    const newSphereOrbitNodeDetails: SphereOrbitNodeDetails = {
      ...existingNodes,
      [orbitDetails.eH]: orbitDetails,
    };
    // Remove old entry if it exists
    if (oldOrbitEh && oldOrbitEh !== orbitDetails.eH) {
      delete newSphereOrbitNodeDetails[oldOrbitEh];
    }
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
  isNewOrbit: boolean,
  oldOrbitId?: string
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
  // Remove old entry if it exists
  if (oldOrbitId && oldOrbitId !== orbitDetails.id) {
    delete updatedState.orbitNodes.byHash[oldOrbitId];
  }
  // Handle root orbits (those without a parent)
  if (!orbitDetails.parentEh) {
    const sphereHash = orbitDetails.sphereHash;
    const sphereId = Object.entries(updatedState.spheres.byHash).find(
      ([id, sphere]) => sphere.details.entryHash === sphereHash
    )?.[0];

    if (
      sphereId &&
      updatedState.spheres.byHash[sphereId]?.hierarchyRootOrbitEntryHashes
    ) {
      // Update the hierarchyRootOrbitEntryHashes array
      if (isNewOrbit) {
        updatedState.spheres.byHash[
          sphereId
        ].hierarchyRootOrbitEntryHashes.push(orbitDetails.eH);
      } else if (oldOrbitId) {
        // Replace old entry hash with new one
        const index =
          updatedState.spheres.byHash[
            sphereId
          ].hierarchyRootOrbitEntryHashes.indexOf(oldOrbitId);
        if (index !== -1) {
          updatedState.spheres.byHash[sphereId].hierarchyRootOrbitEntryHashes[
            index
          ] = orbitDetails.eH;
        }
      }

      // Update the byRootOrbitEntryHash dictionary
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

      updatedState.hierarchies.byRootOrbitEntryHash = {
        [orbitDetails.eH]: newHierarchy,
      };

      // Remove old hierarchy if it exists and is different from the new one
      if (oldOrbitId && oldOrbitId !== orbitDetails.eH) {
        delete updatedState.hierarchies.byRootOrbitEntryHash[oldOrbitId];
      }
    }
  } else {
    // If this is not a root orbit, ensure it's not in the byRootOrbitEntryHash
    delete updatedState.hierarchies.byRootOrbitEntryHash[orbitDetails.eH];
  }

  return updatedState;
};
