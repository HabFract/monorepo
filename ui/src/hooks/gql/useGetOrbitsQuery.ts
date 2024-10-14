import { useSetAtom } from "jotai";
import { appStateAtom } from "../../state/store";
import {
  useGetOrbitsQuery as useGetOrbitsQueryGenerated,
  useGetOrbitsLazyQuery as useGetOrbitsLazyQueryGenerated,
  Orbit,
} from "../../graphql/generated";
import { updateNodeCache, updateAppStateWithOrbit } from "./utils";
import { decodeFrequency } from "../../state/orbit";
import { extractEdges } from "../../graphql/utils";
import { OrbitHashes, OrbitNodeDetails } from "ui/src/state";

export const useGetOrbitsQuery = (opts) => {
  const setAppState = useSetAtom(appStateAtom);

  const result = useGetOrbitsQueryGenerated({
    ...opts,
    onCompleted: (data) => {
      if (data?.orbits) {
        extractEdges(data.orbits).forEach((orbit: Orbit) => {
          const orbitHashes: OrbitHashes = {
            id: orbit.id,
            eH: orbit.eH,
            sphereHash: orbit.sphereHash,
            parentEh: orbit?.parentHash as string | undefined,
          };
          const orbitDetails: OrbitNodeDetails = {
            ...orbitHashes,
            name: orbit.name,
            scale: orbit.scale,
            frequency: decodeFrequency(orbit.frequency),
            startTime: orbit.metadata!.timeframe.startTime,
            endTime: orbit.metadata!.timeframe.endTime as number | undefined,
            description: orbit.metadata!.description as string | undefined,
          };

          updateNodeCache(orbitDetails);

          setAppState((prevState) =>
            updateAppStateWithOrbit(prevState, orbitHashes, false)
          );

          console.warn('Cache update from useGetOrbits')
        });
      }

      opts?.onCompleted && opts.onCompleted(data);
    },
  });

  return {
    ...result,
    isLoading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
};

export const useGetOrbitsLazyQuery = (opts?) => {
  const setAppState = useSetAtom(appStateAtom);

  const [getOrbits, result] = useGetOrbitsLazyQueryGenerated({
    ...opts,
    onCompleted: (data) => {
      if (data?.orbits) {
        extractEdges(data.orbits).forEach((orbit: Orbit) => {
          const orbitHashes: OrbitHashes = {
            id: orbit.id,
            eH: orbit.eH,
            sphereHash: orbit.sphereHash,
            parentEh: orbit?.parentHash as string | undefined,
          };
          const orbitDetails: OrbitNodeDetails = {
            ...orbitHashes,
            name: orbit.name,
            scale: orbit.scale,
            frequency: decodeFrequency(orbit.frequency),
            startTime: orbit.metadata!.timeframe.startTime,
            endTime: orbit.metadata!.timeframe.endTime as number | undefined,
            description: orbit.metadata!.description as string | undefined,
          };

          updateNodeCache(orbitDetails);

          setAppState((prevState) =>
            updateAppStateWithOrbit(prevState, orbitHashes, false)
          );
        });
      }

      opts?.onCompleted && opts.onCompleted(data);
    },
  });

  const wrappedGetOrbits = (options?) => {
    return getOrbits({
      ...options,
      onCompleted: (data) => {
        if (data?.orbits) {
          extractEdges(data.orbits).forEach((orbit: Orbit) => {
            const orbitHashes: OrbitHashes = {
              id: orbit.id,
              eH: orbit.eH,
              sphereHash: orbit.sphereHash,
              parentEh: orbit?.parentHash as string | undefined,
            };
            const orbitDetails: OrbitNodeDetails = {
              ...orbitHashes,
              name: orbit.name,
              scale: orbit.scale,
              frequency: decodeFrequency(orbit.frequency),
              startTime: orbit.metadata!.timeframe.startTime,
              endTime: orbit.metadata!.timeframe.endTime as number | undefined,
              description: orbit.metadata!.description as string | undefined,
            };

            updateNodeCache(orbitDetails);

            setAppState((prevState) =>
              updateAppStateWithOrbit(prevState, orbitHashes, false)
            );
          });
        }

        options?.onCompleted && options.onCompleted(data);
      },
    });
  };

  return [
    wrappedGetOrbits,
    {
      ...result,
      isLoading: result.loading,
      error: result.error,
      refetch: result.refetch,
    },
  ] as const;
};
