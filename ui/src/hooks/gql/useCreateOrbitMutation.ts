import { currentSphereHashesAtom } from './../../state/sphere';
import { useCreateOrbitMutation as useCreateOrbitMutationGenerated } from "../../graphql/generated";
import { appStateAtom } from "../../state/store";
import { useSetAtom } from "jotai";
import { OrbitNodeDetails } from "../../state/types/orbit";
import { currentSphereOrbitNodesAtom, decodeFrequency } from "../../state/orbit";
import { nodeCache, store } from "../../state/jotaiKeyValueStore";
import { currentSphereHasCachedNodesAtom } from "../../state/sphere";
import { SphereHashes, SphereOrbitNodes } from '../../state/types/sphere';
import { ActionHashB64 } from '@holochain/client';

export const useCreateOrbitMutation = (opts) => {
  const setAppState = useSetAtom(appStateAtom);

  return useCreateOrbitMutationGenerated({
    ...opts,
    update(_cache, { data }) {
      if (!data?.createOrbit) return;

      const newOrbit = data.createOrbit as any;
      const newOrbitDetails : OrbitNodeDetails = {
        id: newOrbit.id,
        eH: newOrbit.eH,
        name: newOrbit.name,
        scale: newOrbit.scale,
        frequency: decodeFrequency(newOrbit.frequency),
        startTime: newOrbit.startTime,
        sphereHash: newOrbit.sphereHash,
        endTime: newOrbit.endTime,
        description: newOrbit.description,
        parentEh: newOrbit.parentHash,
      };
      // To be phased out, all appstate will be stored in localstorage anyway
      if(store.get(currentSphereHasCachedNodesAtom)) {
        let sphere = store.get(currentSphereHashesAtom) as SphereHashes;
        let existingNodes = store.get(currentSphereOrbitNodesAtom);
        let newSphereOrbitNodes : SphereOrbitNodes = {
          ...existingNodes,
            [newOrbit.eH]: newOrbitDetails
        };
        store.set(nodeCache.set, sphere.actionHash as ActionHashB64, newSphereOrbitNodes);
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
        if (!newOrbit.parentHash && typeof updatedState?.spheres?.byHash === 'object') {
          const sphereHash = newOrbit.sphereHash;
          const sphereId = Object.entries(updatedState.spheres.byHash).find(([id, sphere]) => sphere.details.entryHash == sphereHash)?.[0];
          if(!sphereId || !updatedState.spheres.byHash[sphereId]?.hierarchyRootOrbitEntryHashes) { console.warn("This sphere has an incomplete entry in the store"); return updatedState };

          updatedState.spheres.byHash[sphereId].hierarchyRootOrbitEntryHashes.push(newOrbit.eH);

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

      opts?.update && opts.update();
    },
  });
};
