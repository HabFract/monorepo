import { useAtom, useSetAtom } from "jotai";
import { appStateAtom } from "../../state/store";
import {
  CreateOrbitResponsePayload,
  useCreateOrbitMutation as useCreateOrbitMutationGenerated,
} from "../../graphql/generated";
import { decodeFrequency } from "../../state/orbit";
import {
  invalidateOrbitHierarchyCache,
  updateAppStateWithOrbit,
  updateNodeCache,
} from "./utils";
import { OrbitHashes, OrbitNodeDetails } from "../../state";

export const useCreateOrbitMutation = (opts) => {
  const [prevState, setAppState] = useAtom(appStateAtom);

  return useCreateOrbitMutationGenerated({
    ...opts,
    update(_cache, { data }) {
      if (!data?.createOrbit) return;

      const newOrbit: CreateOrbitResponsePayload = data.createOrbit;
      const newOrbitHashes: OrbitHashes = {
        id: newOrbit.id,
        eH: newOrbit.eH,
        sphereHash: newOrbit.sphereHash,
        parentEh: newOrbit?.parentHash as string | undefined,
      };
      const newOrbitDetails: OrbitNodeDetails = {
        ...newOrbitHashes,
        name: newOrbit.name,
        scale: newOrbit.scale,
        frequency: decodeFrequency(newOrbit.frequency),
        startTime: newOrbit.metadata!.timeframe.startTime,
        endTime: newOrbit.metadata!.timeframe.endTime as number | undefined,
        description: newOrbit.metadata!.description as string | undefined,
      };

      updateNodeCache(newOrbitDetails);

      const updatedState = updateAppStateWithOrbit(
        prevState,
        newOrbitHashes,
        true
      );
      setAppState(updatedState);
      // console.log('Cache update from useCreateOrbit')

      invalidateOrbitHierarchyCache(newOrbit.sphereHash);

      opts?.update && opts.update();
    },
  });
};
