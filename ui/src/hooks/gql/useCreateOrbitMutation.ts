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
import { useMemo } from "react";
import { DataLoadingQueue } from "../../components/PreloadAllData";

export const useCreateOrbitMutation = (opts) => {
  const [prevState, setAppState] = useAtom(appStateAtom);
  const dataLoadingQueue = useMemo(() => new DataLoadingQueue(), []);

  return useCreateOrbitMutationGenerated({
    ...opts,
    async update(_cache, { data }) {
      if (!data?.createOrbit) return;

      await dataLoadingQueue.enqueue(async () => {
        const newOrbit: CreateOrbitResponsePayload = data.createOrbit;

        await invalidateOrbitHierarchyCache(newOrbit.sphereHash);

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
        console.warn("Cache update from useCreateOrbit");

        opts?.update && opts.update();
      });
    },
  });
};
