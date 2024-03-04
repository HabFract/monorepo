import { useEffect } from 'react';
import { useGetSphereQuery, useGetOrbitsLazyQuery, Orbit, Sphere } from '../graphql/generated';
import { extractEdges } from '../graphql/utils';
import { OrbitNodeDetails, SphereNodeDetailsCache, mapToCacheObject } from '../state/jotaiKeyValueStore';
import miniDB, { store } from '../state/jotaiKeyValueStore';
import { ActionHashB64 } from '@holochain/client';

interface UseFetchAndCacheSphereOrbitsProps {
  sphereAh?: ActionHashB64;
}

interface UseFetchAndCacheSphereOrbitsReturn {
  loading: boolean;
  error?: Error;
  data?: {
    sphere: Sphere,
    orbits: Orbit[]
  };
}

export const useFetchAndCacheSphereOrbits = ({ sphereAh }: UseFetchAndCacheSphereOrbitsProps): UseFetchAndCacheSphereOrbitsReturn => {
  const { loading: loadingSphere, data: dataSphere, error: errorSphere } = useGetSphereQuery({
    variables: { id: sphereAh as string },
    skip: !sphereAh,
  });
  const sphereEh = dataSphere?.sphere?.eH;
  const [getOrbits, { loading: loadingOrbits, error: errorOrbits, data }] = useGetOrbitsLazyQuery({
    fetchPolicy: 'network-only',
    variables: { sphereEntryHashB64: sphereEh },
  });

  useEffect(() => {
    if (sphereEh && dataSphere) {
      getOrbits();
    }
  }, [dataSphere, loadingSphere, sphereEh]);

  useEffect(() => {
    if (data) {
      let orbits: Orbit[] = extractEdges(data.orbits);
      let indexedOrbitData : Array<[string, OrbitNodeDetails]> = Object.entries(orbits.map(mapToCacheObject))
        .map(([_idx, value]) => [value.id, value]);
      let indexedSphereData: SphereNodeDetailsCache = {};

      const entries = indexedOrbitData.reduce((cacheObject, [_id, entry], idx) => {
        const indexKey = (entry).eH as string;
        if (idx === 0) {
          cacheObject[sphereAh as keyof typeof indexedSphereData] = { [indexKey]: entry };
        }
        cacheObject[sphereAh as keyof typeof indexedSphereData][indexKey] = entry;
        return cacheObject;
      }, indexedSphereData);

      store.set(miniDB.setMany, Object.entries(entries));
    }
  }, [data, sphereAh]);

  return {
    loading: loadingSphere || loadingOrbits,
    error: errorSphere || errorOrbits,
    data: dataSphere && data ? { sphere: dataSphere.sphere, orbits: extractEdges(data.orbits) } : undefined,
  };
};