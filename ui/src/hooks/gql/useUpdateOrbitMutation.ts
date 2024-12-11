import { useAtom, useSetAtom } from "jotai";
import { appStateChangeAtom, store } from "../../state/store";
import {
  UpdateOrbitResponsePayload,
  useUpdateOrbitMutation as useUpdateOrbitMutationGenerated,
} from "../../graphql/generated";
import {
  updateNodeCache,
  updateAppStateWithOrbit,
  invalidateOrbitHierarchyCache,
} from "./utils";
import { decodeFrequency, getOrbitEhFromId } from "../../state/orbit";
import { OrbitHashes } from "../../state";

export const useUpdateOrbitMutation = (opts) => {
  const [prevState, setAppState] = useAtom(appStateChangeAtom);

  return useUpdateOrbitMutationGenerated({
    ...opts,
    update(_cache, { data }, { variables }) {
      if (!data?.updateOrbit) return;
      const updatedOrbit: UpdateOrbitResponsePayload = data.updateOrbit;
      const updatedOrbitHashes: OrbitHashes = {
        id: updatedOrbit.id,
        eH: updatedOrbit.eH,
        sphereHash: updatedOrbit.sphereHash,
        parentEh: updatedOrbit?.parentHash as string | undefined,
      };
      const updatedOrbitDetails = {
        ...updatedOrbitHashes,
        name: updatedOrbit.name,
        scale: updatedOrbit.scale,
        frequency: decodeFrequency(updatedOrbit.frequency),
        startTime: updatedOrbit.metadata!.timeframe.startTime,
        endTime: updatedOrbit.metadata!.timeframe.endTime as number | undefined,
        description: updatedOrbit.metadata!.description as string | undefined,
      };

      // Extract the old ID from the mutation variables
      const oldOrbitId = store.get(getOrbitEhFromId(variables!.orbitFields.id));
      console.log("oldOrbitId :>> ", oldOrbitId);
      updateNodeCache(updatedOrbitDetails, oldOrbitId);

      const updatedState = updateAppStateWithOrbit(
        prevState,
        updatedOrbitHashes,
        false,
        oldOrbitId
      );
      setAppState(updatedState);

      console.warn("Cache update from useUpdateOrbit");

      // A change to an orbit will mean a new entry hash is created, changing the tree, so we need to invalidate.
      invalidateOrbitHierarchyCache(updatedOrbit.sphereHash);

      opts?.update && opts.update();
    },
  });
};
